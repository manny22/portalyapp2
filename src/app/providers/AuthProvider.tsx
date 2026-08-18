import { useState, useCallback, useEffect } from 'react'
import { AuthContext } from '@/shared/hooks/useAuth'
import type { AuthContextValue } from '@/shared/hooks/useAuth'
import type { AuthSession } from '@/core/domain/models/auth.model'
import type { User } from '@/core/domain/models/user.model'
import { container } from '@/infrastructure/di/container'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const s = container.authRepository.getSession()
    if (s) {
      setSession(s)
      loadUser()
    }
    setIsLoading(false)
  }, [])

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await container.authRepository.getMe()
      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const s = await container.authRepository.login({ email, password })
    setSession(s)
    await loadUser()
  }, [loadUser])

  const logout = useCallback(async () => {
    await container.authRepository.logout()
    setSession(null)
    setUser(null)
  }, [])

  if (isLoading) {
    return null
  }

  const value: AuthContextValue = {
    session,
    user,
    isAuthenticated: !!session,
    login,
    logout,
  }

  return <AuthContext value={value}>{children}</AuthContext>
}
