import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { adminLogin, clearAdminSession, getAdminSession } from '../services/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const initial = getAdminSession()
  const [token, setToken] = useState(initial.token || '')
  const [role, setRole] = useState(initial.role || '')

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken('')
      setRole('')
    }

    window.addEventListener('admin-unauthorized', handleUnauthorized)
    return () => window.removeEventListener('admin-unauthorized', handleUnauthorized)
  }, [])

  const login = async (password) => {
    const data = await adminLogin(password)
    setToken(data.token || '')
    setRole(data.role || '')
    return data
  }

  const logout = () => {
    clearAdminSession()
    setToken('')
    setRole('')
  }

  const value = useMemo(
    () => ({
      token,
      role,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, role]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth doit être utilisé dans <AdminAuthProvider>')
  }
  return context
}
