import type { AuthRepositoryPort } from '@/core/domain/ports/auth.repository.port'
import type { AuthSession, LoginDto } from '@/core/domain/models/auth.model'
import { MOCK_USERS } from '../data/users.data'
import { MOCK_PROPERTIES } from '../data/properties.data'
import { simulateDelay } from './base-mock.repository'

const SESSION_KEY = 'janora_session'

export class AuthMockRepository implements AuthRepositoryPort {
  async login(data: LoginDto): Promise<AuthSession> {
    await simulateDelay()

    const user = MOCK_USERS.find(u => u.email.value === data.email.toLowerCase())
    if (!user) throw new Error('Credenciales incorrectas')
    if (user.passwordHash !== data.password) throw new Error('Credenciales incorrectas')
    if (!user.isActive) throw new Error('Usuario inactivo')

    const property = user.propertyId
      ? MOCK_PROPERTIES.find(p => p.id === user.propertyId)
      : null

    const session: AuthSession = {
      accessToken: `mock-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        fullName: user.name.full,
        email: user.email.value,
        role: user.role,
        propertyId: user.propertyId,
        propertyName: property?.name ?? null,
        residentId: user.residentId,
      },
    }

    this.saveSession(session)
    return session
  }

  async logout(): Promise<void> {
    await simulateDelay()
    this.clearSession()
  }

  getSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as AuthSession) : null
    } catch {
      return null
    }
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY)
  }
}
