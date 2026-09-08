'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import styles from '../auth.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Redirecting...')
      router.push('/dashboard')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Activity size={20} color="white" /></div>
          <span>MediPulse <span className="serif-italic" style={{ color: 'var(--bio-emerald)' }}>AI</span></span>
        </div>

        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.sub}>Start tracking your health for free</p>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <label className="field-label">Full Name</label>
            <div className={styles.inputWrap}>
              <User size={16} className={styles.inputIcon} />
              <input
                type="text"
                className={`input ${styles.inputPadded}`}
                placeholder="Amandeep Singh"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                id="signup-name"
              />
            </div>
          </div>

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
                id="signup-email"
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
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                id="signup-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading} id="signup-submit">
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link href="/auth/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
