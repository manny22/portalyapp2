import { useState, useCallback, useEffect } from 'react'
import { AuthContext } from '@/shared/hooks/useAuth'
import type { AuthContextValue } from '@/shared/hooks/useAuth'
import type { AuthSession } from '@/core/domain/models/auth.model'
import type { User } from '@/core/domain/models/user.model'
import { container } from '@/infrastructure/di/container'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    container.authRepository.getSession()
  )
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() =>
    Boolean(container.authRepository.getSession())
  )

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await container.authRepository.getMe()
      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    container.authRepository
      .getMe()
      .then(currentUser => setUser(currentUser))
      .catch(() => {
        // Si falla cargar el usuario, limpiar sesión
        container.authRepository.clearSession()
        setSession(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
    // Solo debe ejecutar el bootstrap una vez al montar; login()/logout() manejan sus propias actualizaciones de sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const s = await container.authRepository.login({ email, password })
      setSession(s)
      await loadUser()
    },
    [loadUser]
  )

  const logout = useCallback(async () => {
    await container.authRepository.logout()
    setSession(null)
    setUser(null)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <svg className="h-8 w-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Cargando sesión...</p>
        </div>
      </div>
    )
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
