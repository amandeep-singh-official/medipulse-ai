'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from '../auth.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Activity size={20} color="white" /></div>
          <span>MediPulse <span className="serif-italic" style={{ color: 'var(--bio-emerald)' }}>AI</span></span>
        </div>

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your health dashboard</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className="field-label">Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                className={`input ${styles.inputPadded}`}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                id="login-email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className="field-label">Password</label>
            <div className={styles.inputWrap}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'}
                className={`input ${styles.inputPadded} ${styles.inputPaddedRight}`}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="login-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading} id="login-submit">
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account? <Link href="/auth/signup" className={styles.switchLink}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
