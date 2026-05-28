import { useState, useCallback, useEffect } from 'react'
import { AuthContext } from '@/shared/hooks/useAuth'
import type { AuthContextValue } from '@/shared/hooks/useAuth'
import type { AuthSession, AuthUser } from '@/core/domain/models/auth.model'
import { container } from '@/infrastructure/di/container'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    const s = container.authRepository.getSession()
    if (s) setSession(s)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const s = await container.authRepository.login({ email, password })
    setSession(s)
  }, [])

  const logout = useCallback(async () => {
    await container.authRepository.logout()
    setSession(null)
  }, [])

  const user: AuthUser | null = session?.user ?? null

  const value: AuthContextValue = {
    session,
    user,
    isAuthenticated: !!session,
    login,
    logout,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
