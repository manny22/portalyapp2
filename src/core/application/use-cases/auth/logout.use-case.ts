import type { AuthRepositoryPort } from '@/core/domain/ports/auth.repository.port'

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepositoryPort) {}

  async execute(): Promise<void> {
    await this.authRepository.logout()
  }
}
