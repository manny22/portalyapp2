import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { AccessLog } from '@/core/domain/models/access-log.model'

export class GetPeopleInsideUseCase {
  constructor(private readonly accessLogRepository: AccessLogRepositoryPort) {}

  async execute(propertyId: string): Promise<AccessLog[]> {
    return this.accessLogRepository.findPeopleInside(propertyId)
  }
}
