import { createContext, useContext } from 'react'
import type { AuthSession, AuthUser } from '@/core/domain/models/auth.model'

export interface AuthContextValue {
  session: AuthSession | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
