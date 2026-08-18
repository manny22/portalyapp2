import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { VisitAuthorization, CreateAuthorizationDto } from '@/core/domain/models/visit-authorization.model'

export class CreateAuthorizationUseCase {
  constructor(private readonly authorizationRepository: AuthorizationRepositoryPort) {}

  async execute(data: CreateAuthorizationDto): Promise<VisitAuthorization> {
    // Validate required fields
    if (!data.visitorId) {
      throw new Error('El visitante es requerido')
    }
    if (!data.residentId) {
      throw new Error('El residente es requerido')
    }
    if (!data.validFrom || !data.validUntil) {
      throw new Error('Las fechas de validez son requeridas')
    }

    // Validate date range
    const validFrom = new Date(data.validFrom)
    const validUntil = new Date(data.validUntil)
    if (validUntil <= validFrom) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
    }

    return this.authorizationRepository.create(data)
  }
}
