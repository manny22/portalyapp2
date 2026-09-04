import type { AuthRepositoryPort } from '@/core/domain/ports/auth.repository.port'
import type { AuthSession, LoginDto } from '@/core/domain/models/auth.model'

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(data: LoginDto): Promise<AuthSession> {
    if (!data.email || !data.password) {
      throw new Error('Email y contraseña son requeridos')
    }
    return this.authRepository.login(data)
  }
}
