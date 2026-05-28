import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { AccessLog, RegisterExitDto } from '@/core/domain/models/access-log.model'

export class RegisterExitUseCase {
  constructor(private readonly accessLogRepository: AccessLogRepositoryPort) {}

  async execute(data: RegisterExitDto): Promise<AccessLog> {
    const log = await this.accessLogRepository.findById(data.accessLogId)
    if (!log) throw new Error('Registro de acceso no encontrado')
    if (log.status === 'EXITED') throw new Error('Esta persona ya registró salida')
    return this.accessLogRepository.registerExit(data)
  }
}
