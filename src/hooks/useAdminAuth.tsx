'use client'
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'root' | 'admin' | 'employee'
  permissions: string[]
  mustChangePassword?: boolean
}

interface AdminAuthContext {
  user: AdminUser | null
  token: string | null
  ready: boolean
  logout: () => void
  hasPermission: (permission: string) => boolean
  isRoot: boolean
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>
  setAuthData: (user: AdminUser, token: string) => void
  getToken: () => string | null
}

const AuthContext = createContext<AdminAuthContext | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('adminToken')
      const storedUser = localStorage.getItem('adminUser')
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
    } catch {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    }
    setReady(true)
  }, [])

  const setAuthData = useCallback((newUser: AdminUser, newToken: string) => {
    localStorage.setItem('adminToken', newToken)
    localStorage.setItem('adminUser', JSON.stringify(newUser))
    setUser(newUser)
    setToken(newToken)
  }, [])

  const getToken = useCallback(() => localStorage.getItem('adminToken'), [])

  const logout = useCallback(async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }) } catch {}
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    setToken(null)
    router.push('/admin/login')
  }, [router])

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false
    if (user.role === 'root') return true
    return user.permissions.includes(permission)
  }, [user])

  // Refresh token and return new access token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' })
      if (res.ok) {
        const { accessToken } = await res.json()
        localStorage.setItem('adminToken', accessToken)
        setToken(accessToken)
        return accessToken
      }
    } catch {}
    return null
  }, [])

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const isFormData = options.body instanceof FormData

    const buildHeaders = (tkn: string): Record<string, string> => {
      const h: Record<string, string> = { 'Authorization': `Bearer ${tkn}` }
      if (!isFormData) h['Content-Type'] = 'application/json'
      return h
    }

    const doFetch = (tkn: string) =>
      fetch(url, { ...options, headers: buildHeaders(tkn) })

    // Get current token
    let currentToken = localStorage.getItem('adminToken')
    if (!currentToken) {
      router.push('/admin/login')
      throw new Error('No token')
    }

    const res = await doFetch(currentToken)

    // Handle 401 — try to refresh token once
    if (res.status === 401) {
      const newToken = await refreshToken()
      if (newToken) {
        return doFetch(newToken)
      }
      logout()
      throw new Error('Session expired')
    }

    return res
  }, [router, logout, refreshToken])

  return (
    <AuthContext.Provider value={{
      user, token, ready, logout, hasPermission,
      isRoot: user?.role === 'root',
      fetchWithAuth, setAuthData, getToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
