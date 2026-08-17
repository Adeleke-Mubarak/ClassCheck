import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getUserRole } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(user) {
    if (!user) {
      setProfile(null)
      setRole(null)
      return
    }

    const detectedRole = await getUserRole(user)
    setRole(detectedRole)

    if (detectedRole === 'student') {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      setProfile(data)
    } else if (detectedRole === 'sender') {
      const { data } = await supabase
        .from('senders')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      setProfile(data)
    } else if (detectedRole === 'admin') {
      setProfile({ full_name: 'Admin', email: user.email })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      loadProfile(u)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = { user, profile, role, loading, refreshProfile: () => loadProfile(user) }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
