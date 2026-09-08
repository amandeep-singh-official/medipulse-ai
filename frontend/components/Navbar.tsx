'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Activity, LayoutDashboard, UploadCloud, FileText, LogOut, User } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { createClient } from '@/lib/supabase'
import styles from './Navbar.module.css'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/upload', icon: UploadCloud, label: 'Ingest Report' },
  { href: '/reports', icon: FileText, label: 'Telemetry Vault' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<{ fullName?: string; avatarUrl?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle()

        if (data && (data.full_name || data.avatar_url)) {
          setProfile({ fullName: data.full_name, avatarUrl: data.avatar_url })
        } else {
          setProfile({
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Profile',
            avatarUrl: session.user.user_metadata?.avatar_url
          })
        }
      } else {
        setProfile(null)
      }
    }

    loadProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Activity size={17} strokeWidth={2.5} color="#ffffff" />
          </div>
          <span className={styles.logoText}>
            MediPulse <span className="serif-italic" style={{ color: 'var(--bio-emerald)' }}>AI</span>
          </span>
        </Link>

        {/* Clinical Telemetry Badge */}
        <div className={styles.telemetryBadge}>
          <span className="pulse-dot" />
          <span className="mono">VAULT // ACTIVE</span>
        </div>

        {/* Nav Links */}
        <div className={styles.links}>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.link} ${isActive ? styles.active : ''}`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* User Avatar Chip */}
          {profile && (
            <Link
              href="/settings"
              className={`${styles.userChip} ${pathname === '/settings' ? styles.userChipActive : ''}`}
              title="Settings"
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className={styles.avatarMini} />
              ) : (
                <div className={styles.avatarFallbackMini}>{getInitials(profile.fullName)}</div>
              )}
              <span className={styles.userName}>
                {profile.fullName?.split(' ')[0] || 'Settings'}
              </span>
            </Link>
          )}

          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Log Out of Vault">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  )
}
