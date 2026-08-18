import type { AuthSession, LoginDto, RefreshTokenDto } from '../models/auth.model'
import type { User } from '../models/user.model'

export interface AuthRepositoryPort {
  login(data: LoginDto): Promise<AuthSession>
  logout(): Promise<void>
  refresh(data: RefreshTokenDto): Promise<AuthSession>
  getMe(): Promise<User>
  getSession(): AuthSession | null
  saveSession(session: AuthSession): void
  clearSession(): void
}
