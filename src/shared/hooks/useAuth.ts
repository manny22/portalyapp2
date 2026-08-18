import { createContext, useContext } from 'react'
import type { AuthSession } from '@/core/domain/models/auth.model'
import type { User } from '@/core/domain/models/user.model'

export interface AuthContextValue {
  session: AuthSession | null
  user: User | null
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
