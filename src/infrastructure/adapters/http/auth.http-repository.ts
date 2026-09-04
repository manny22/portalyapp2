import type { AuthRepositoryPort } from '@/core/domain/ports/auth.repository.port'
import type { AuthSession, LoginDto, RefreshTokenDto } from '@/core/domain/models/auth.model'
import type { User } from '@/core/domain/models/user.model'
import { httpClient } from './base-http-client'

const SESSION_STORAGE_KEY = 'auth_session'

export class AuthHttpRepository implements AuthRepositoryPort {
  async login(data: LoginDto): Promise<AuthSession> {
    const response = await httpClient.post<AuthSession>('/auth/login', data)
    this.saveSession(response)
    return response
  }

  async logout(): Promise<void> {
    try {
      const session = this.getSession()
      if (session?.refreshToken) {
        await httpClient.post('/auth/logout', { refreshToken: session.refreshToken })
      }
    } finally {
      this.clearSession()
    }
  }

  async refresh(data: RefreshTokenDto): Promise<AuthSession> {
    const response = await httpClient.post<AuthSession>('/auth/refresh', data)
    this.saveSession(response)
    return response
  }

  async getMe(): Promise<User> {
    return httpClient.get<User>('/auth/me')
  }

  getSession(): AuthSession | null {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }

  saveSession(session: AuthSession): void {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }

  clearSession(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  }
}
