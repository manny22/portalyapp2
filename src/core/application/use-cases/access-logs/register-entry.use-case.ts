import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { AccessLog, RegisterEntryDto } from '@/core/domain/models/access-log.model'

export class RegisterEntryUseCase {
  constructor(
    private readonly accessLogRepository: AccessLogRepositoryPort,
    private readonly authorizationRepository: AuthorizationRepositoryPort
  ) {}

  async execute(data: RegisterEntryDto): Promise<AccessLog> {
    // Duplicate check for residents
    if (data.residentId) {
      const activeEntry = await this.accessLogRepository.findActiveEntryByResident(
        data.residentId,
        data.propertyId
      )
      if (activeEntry) throw new Error('Este residente ya se encuentra dentro de la copropiedad')
    }

    // Duplicate check for registered visitors
    if (data.visitorId) {
      const activeEntry = await this.accessLogRepository.findActiveEntryByPerson(
        data.visitorId,
        data.propertyId
      )
      if (activeEntry) throw new Error('Este visitante ya se encuentra dentro de la copropiedad')
    }

    // Registered visitors (with visitorId) must have a valid authorization
    if (data.visitorId && !data.authorizationId) {
      throw new Error('El visitante no cuenta con una autorización de ingreso activa')
    }

    // Validate the authorization when provided
    if (data.authorizationId) {
      const authorization = await this.authorizationRepository.findById(data.authorizationId)
      if (!authorization) throw new Error('Autorización no encontrada')
      if (authorization.status === 'CANCELLED') throw new Error('La autorización está cancelada')
      if (authorization.status === 'EXPIRED') throw new Error('La autorización ha expirado')
      if (authorization.status === 'USED' && authorization.type === 'ONE_TIME') {
        throw new Error('Esta autorización de un solo uso ya fue utilizada')
      }
      if (authorization.validityPeriod && authorization.validityPeriod.isExpired()) {
        throw new Error('La autorización ha expirado')
      }
    }

    const log = await this.accessLogRepository.registerEntry(data)

    // Mark ONE_TIME authorization as used after entry
    if (data.authorizationId) {
      const authorization = await this.authorizationRepository.findById(data.authorizationId)
      if (authorization?.type === 'ONE_TIME') {
        await this.authorizationRepository.markAsUsed(data.authorizationId)
      }
    }

    return log
  }
}
