export interface ProfileAttributes {
  fullName: string
  age?: number | string | null
  gender?: string | null
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export const VALID_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const
export type GenderType = typeof VALID_GENDERS[number]

export const VALID_THEMES = ['light', 'dark', 'system'] as const
export type ThemeType = typeof VALID_THEMES[number]

/**
 * Validate profile demographic and personal attributes.
 */
export function validateProfileAttributes(attributes: ProfileAttributes): ValidationResult {
  const trimmedName = (attributes.fullName || '').trim()
  if (!trimmedName) {
    return { isValid: false, error: 'Full name is required.' }
  }

  if (attributes.age !== undefined && attributes.age !== null && attributes.age !== '') {
    const numericAge = typeof attributes.age === 'number' ? attributes.age : parseInt(attributes.age, 10)
    if (isNaN(numericAge) || numericAge < 1 || numericAge > 120) {
      return { isValid: false, error: 'Age must be a valid number between 1 and 120.' }
    }
  }

  if (attributes.gender && attributes.gender !== '') {
    if (!VALID_GENDERS.includes(attributes.gender as GenderType)) {
      return { isValid: false, error: `Gender must be one of: ${VALID_GENDERS.join(', ')}.` }
    }
  }

  return { isValid: true }
}

/**
 * Validate password update parameters.
 */
export function validatePasswordChange(password: string, confirmPassword: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'New password is required.' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' }
  }

  return { isValid: true }
}

/**
 * Validate the destructive account deletion confirmation phrase.
 * Requires typing "delete my account" exactly (case-insensitive, trimmed).
 */
export function validateDeleteConfirmation(typedPhrase: string): boolean {
  return (typedPhrase || '').trim().toLowerCase() === 'delete my account'
}

/**
 * Check if the provided theme string is a supported system theme.
 */
export function isValidTheme(theme: string): theme is ThemeType {
  return VALID_THEMES.includes(theme as ThemeType)
}
