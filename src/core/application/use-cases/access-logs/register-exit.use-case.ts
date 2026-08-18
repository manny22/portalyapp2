import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { AccessLog, RegisterExitDto } from '@/core/domain/models/access-log.model'

export class RegisterExitUseCase {
  constructor(private readonly accessLogRepository: AccessLogRepositoryPort) {}

  async execute(data: RegisterExitDto): Promise<AccessLog> {
    return this.accessLogRepository.registerExit(data)
  }
}
