import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile() {
    try {
      const { user } = await api.getSession()
      setUser(user)
      if (user) {
        setProfile(user)
        setRole(user.role)
      } else {
        setProfile(null)
        setRole(null)
      }
    } catch (err) {
      setUser(null)
      setProfile(null)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const value = { user, profile, role, loading, refreshProfile: loadProfile }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
