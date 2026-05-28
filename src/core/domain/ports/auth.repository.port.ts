import type { AuthSession, LoginDto } from '../models/auth.model'

export interface AuthRepositoryPort {
  login(data: LoginDto): Promise<AuthSession>
  logout(): Promise<void>
  getSession(): AuthSession | null
  saveSession(session: AuthSession): void
  clearSession(): void
}
