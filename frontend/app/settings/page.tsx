'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Shield, AlertTriangle, Lock,
  CheckCircle, RefreshCw, X, Eye, EyeOff, Trash2, Camera
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'
import { deleteUserAccount } from '@/lib/api'
import {
  validateProfileAttributes,
  validatePasswordChange,
  validateDeleteConfirmation,
  VALID_GENDERS,
} from '@/lib/settingsValidation'
import toast from 'react-hot-toast'
import styles from './page.module.css'

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth/login'); return }
      setUserId(session.user.id)
      setEmail(session.user.email || '')
      try {
        const { data: profile } = await supabase
          .from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) {
          setFullName(profile.full_name || '')
          setAge(profile.age ? String(profile.age) : '')
          setGender(profile.gender || '')
          setAvatarUrl(profile.avatar_url || '')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    })
  }, [router])

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].substring(0, 2).toUpperCase()
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateProfileAttributes({ fullName, age, gender })
    if (!validation.isValid) { toast.error(validation.error || 'Validation error'); return }
    setSavingProfile(true)
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim(), age: age ? parseInt(age, 10) : null, gender: gender || null })
        .eq('id', userId)
      if (error) throw error
      toast.success('Profile saved.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast.error('File must be under 3 MB'); return }
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`
    setUploadingAvatar(true)
    const supabase = createClient()
    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars').upload(filePath, file, { upsert: true })
      if (uploadError) {
        if (uploadError.message?.includes('bucket not found')) {
          toast.error('Storage bucket "avatars" is not set up yet. Run the SQL migration first.')
          return
        }
        throw uploadError
      }
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const { error: profileError } = await supabase
        .from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', userId)
      if (profileError) throw profileError
      setAvatarUrl(urlData.publicUrl)
      toast.success('Photo updated.')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validatePasswordChange(newPassword, confirmPassword)
    if (!validation.isValid) { toast.error(validation.error || 'Invalid password'); return }
    setUpdatingPassword(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Password updated.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!validateDeleteConfirmation(deleteConfirmationText)) {
      toast.error('Type "delete my account" to confirm.')
      return
    }
    setDeletingAccount(true)
    try {
      await deleteUserAccount()
      const supabase = createClient()
      await supabase.auth.signOut()
      localStorage.clear()
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account')
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container" style={{ padding: '40px 24px 60px', maxWidth: 720 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: 36, width: 180, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 320, borderRadius: 16 }} />
            <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 24px 80px', maxWidth: 720 }}>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your account information and preferences.</p>
        </div>

        <div className={styles.sectionsStack}>

          {/* ── Profile ── */}
          <motion.section
            className={styles.settingsCard}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className={styles.sectionLabel}>Profile</div>

            {/* Centered avatar */}
            <div className={styles.avatarCenter}>
              <div
                className={styles.avatarRing}
                onClick={() => fileInputRef.current?.click()}
                title="Click to change photo"
              >
                {avatarUrl
                  ? <img src={avatarUrl} alt="Profile photo" className={styles.avatarImg} />
                  : <div className={styles.avatarInitials}>{getInitials(fullName)}</div>
                }
                <div className={styles.avatarOverlay}>
                  {uploadingAvatar
                    ? <RefreshCw size={18} className="spin" />
                    : <Camera size={18} />
                  }
                </div>
              </div>
              <p className={styles.avatarHint}>
                {uploadingAvatar ? 'Uploading…' : 'Click to update photo'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className={styles.divider} />

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    className="input"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="email">
                    Email
                    <span className={styles.readOnlyBadge}><Lock size={9} /> Read only</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`input ${styles.inputDisabled}`}
                    value={email}
                    disabled
                    readOnly
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="age">Age</label>
                  <input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    className="input"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="gender">Biological Sex</label>
                  <select
                    id="gender"
                    className="input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Not specified</option>
                    {VALID_GENDERS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-primary"
                  id="save-profile-btn"
                >
                  {savingProfile ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={14} />}
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.section>

          {/* ── Password ── */}
          <motion.section
            className={styles.settingsCard}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.06 }}
          >
            <div className={styles.sectionLabel}>Password</div>
            <p className={styles.sectionDescription}>Choose a strong password to keep your account secure.</p>

            <form onSubmit={handleUpdatePassword} style={{ marginTop: 18 }}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="newPassword">New Password</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.inputLabel} htmlFor="confirmPassword">Confirm Password</label>
                  <div className={styles.inputWithIcon}>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline requirement hints */}
              <div className={styles.passwordHints}>
                <span className={`${styles.hint} ${newPassword.length >= 8 ? styles.hintMet : ''}`}>
                  <CheckCircle size={12} /> At least 8 characters
                </span>
                <span className={`${styles.hint} ${newPassword && newPassword === confirmPassword ? styles.hintMet : ''}`}>
                  <CheckCircle size={12} /> Passwords match
                </span>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="submit"
                  disabled={updatingPassword || !newPassword || !confirmPassword}
                  className="btn btn-secondary"
                  id="update-password-btn"
                >
                  {updatingPassword ? <RefreshCw size={14} className="spin" /> : <Shield size={14} />}
                  {updatingPassword ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.section>

          {/* ── Delete Account ── */}
          <motion.section
            className={`${styles.settingsCard} ${styles.deleteCard}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: 0.12 }}
          >
            <div className={styles.sectionLabel} style={{ color: 'var(--diagnostic-crimson)' }}>Delete Account</div>

            <div className={styles.deleteRow}>
              <p className={styles.deleteDesc}>
                Permanently delete your account and all associated health records. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => { setDeleteConfirmationText(''); setIsDeleteModalOpen(true) }}
                className={`btn ${styles.btnDestructive}`}
                id="open-delete-modal-btn"
              >
                <Trash2 size={14} />
                Delete Account
              </button>
            </div>
          </motion.section>

        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div
            className={styles.modalOverlay}
            onClick={() => !deletingAccount && setIsDeleteModalOpen(false)}
          >
            <motion.div
              className={styles.modalDialog}
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <span className={styles.modalTitle}>
                  <AlertTriangle size={17} />
                  Delete your account?
                </span>
                <button
                  onClick={() => !deletingAccount && setIsDeleteModalOpen(false)}
                  className={styles.modalCloseBtn}
                  disabled={deletingAccount}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <p className={styles.modalWarning}>
                  This will permanently delete your account and remove all your health reports
                  and biomarker data. <strong>This action cannot be reversed.</strong>
                </p>

                <div className={styles.formGroup} style={{ marginTop: 4 }}>
                  <label className={styles.inputLabel} htmlFor="deleteConfirm">
                    Type <span style={{ color: 'var(--diagnostic-crimson)', fontStyle: 'normal' }}>delete my account</span> to confirm
                  </label>
                  <input
                    id="deleteConfirm"
                    type="text"
                    className="input"
                    placeholder="delete my account"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    disabled={deletingAccount}
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={deletingAccount}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={!validateDeleteConfirmation(deleteConfirmationText) || deletingAccount}
                  className={`btn ${styles.btnDestructive}`}
                  id="confirm-delete-account-btn"
                >
                  {deletingAccount ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                  {deletingAccount ? 'Deleting…' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
