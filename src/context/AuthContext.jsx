import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useLanguage } from './LanguageContext.jsx'
import { useTheme } from './ThemeContext.jsx'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [authEvent, setAuthEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  const { theme } = useTheme()
  const { lang } = useLanguage()

  // Simpan nilai aktif theme & lang ke dalam ref agar tidak menjadi dependency effect
  const themeRef = useRef(theme)
  const langRef = useRef(lang)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  // Inisialisasi sesi dan listener onAuthStateChange (tanpa pemanggilan async di dalam callback)
  useEffect(() => {
    let isMounted = true

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // PENTING: Jangan lakukan await ke metode Supabase di dalam callback ini untuk mencegah deadlock
      if (isMounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setAuthEvent(event)
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // useEffect terpisah: memastikan default user_settings ada dengan ON CONFLICT DO NOTHING
  // Hanya bergantung pada user?.id agar berjalan sekali per user, tidak menimpa data tiap login
  useEffect(() => {
    if (!user?.id) return

    async function ensureUserSettings() {
      try {
        await supabase.from('user_settings').upsert(
          {
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Trader',
            balance: 0,
            lang: langRef.current || 'id',
            theme: themeRef.current || 'dark',
          },
          {
            onConflict: 'user_id',
            ignoreDuplicates: true, // ON CONFLICT DO NOTHING
          }
        )
      } catch (err) {
        console.error('[AuthContext] Error ensuring user_settings:', err)
      }
    }

    ensureUserSettings()
  }, [user?.id])

  // FR-AUTH-1: Login dengan email & password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
    return data
  }

  // FR-AUTH-2: Registrasi akun baru
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    if (error) throw error
    return data
  }

  // FR-AUTH-5: Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // FR-AUTH-3: Kirim link reset password
  const sendPasswordReset = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return data
  }

  // FR-AUTH-3b: Update password baru via token pemulihan
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return data
  }

  const value = {
    user,
    session,
    authEvent,
    loading,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

