import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { AccessLog, RegisterEntryDto } from '@/core/domain/models/access-log.model'

export class RegisterEntryUseCase {
  constructor(
    private readonly accessLogRepository: AccessLogRepositoryPort,
    private readonly authorizationRepository: AuthorizationRepositoryPort
  ) {}

  async execute(data: RegisterEntryDto): Promise<AccessLog> {
    // Validate authorization if provided
    if (data.authorizationId) {
      const authorization = await this.authorizationRepository.findById(data.authorizationId)
      if (!authorization) {
        throw new Error('Autorización no encontrada')
      }
      if (authorization.status !== 'ACTIVE') {
        throw new Error(`La autorización no está activa (estado: ${authorization.status})`)
      }
    }

    return this.accessLogRepository.registerEntry(data)
  }
}
