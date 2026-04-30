import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, type AuthResponse, getToken, setToken, type UserMe } from '../lib/api'

type AuthContextValue = {
  user: UserMe | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (payload: { email: string; password: string; fullName: string; phone?: string }) => Promise<AuthResponse>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [user, setUser] = useState<UserMe | null>(null)
  const [loading, setLoading] = useState(true)

  async function refreshMe() {
    if (!token) {
      setUser(null)
      return
    }
    const me = await api.auth.me()
    setUser(me)
  }

  useEffect(() => {
    let active = true
    async function init() {
      if (!token) {
        if (active) {
          setUser(null)
          setLoading(false)
        }
        return
      }
      try {
        const me = await api.auth.me()
        if (active) setUser(me)
      } catch {
        if (active) {
          setToken(null)
          setTokenState(null)
          setUser(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    init()
    return () => {
      active = false
    }
  }, [token])

  async function handleAuthResult(result: AuthResponse) {
    setToken(result.token)
    setTokenState(result.token)
    const me = await api.auth.me()
    setUser(me)
  }

  async function login(email: string, password: string) {
    const result = await api.auth.login({ email, password })
    await handleAuthResult(result)
    return result
  }

  async function register(payload: { email: string; password: string; fullName: string; phone?: string }) {
    const result = await api.auth.register(payload)
    await handleAuthResult(result)
    return result
  }

  function logout() {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout, refreshMe }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

