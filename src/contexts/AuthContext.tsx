import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { login as apiLogin, getMe } from '../api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isRestoring: boolean
  login: (teamCode: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'))
  const [isRestoring, setIsRestoring] = useState(true)

  useEffect(() => {
    if (!token) {
      setIsRestoring(false)
      return
    }
    getMe()
      .then(setUser)
      .catch(() => {
        sessionStorage.removeItem('token')
        setToken(null)
      })
      .finally(() => setIsRestoring(false))
  }, [token])

  const login = useCallback(async (teamCode: string, email: string, password: string) => {
    const res = await apiLogin(teamCode, email, password)
    sessionStorage.setItem('token', res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isRestoring, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
