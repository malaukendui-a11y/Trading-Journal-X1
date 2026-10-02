import { useContext } from 'react'
import { UserSettingsContext } from '../context/UserSettingsContext.jsx'

/**
 * Hook konsumen untuk UserSettingsContext.
 * Melempar error jika digunakan di luar UserSettingsProvider.
 */
export function useUserSettings() {
  const context = useContext(UserSettingsContext)
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider')
  }
  return context
}

