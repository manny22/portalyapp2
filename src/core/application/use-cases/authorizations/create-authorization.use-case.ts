import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { VisitAuthorization, CreateAuthorizationDto } from '@/core/domain/models/visit-authorization.model'

export class CreateAuthorizationUseCase {
  constructor(private readonly authorizationRepository: AuthorizationRepositoryPort) {}

  async execute(data: CreateAuthorizationDto): Promise<VisitAuthorization> {
    if (data.visitorSource === 'EXISTING' && !data.visitorId) {
      throw new Error('Debe seleccionar un visitante registrado')
    }
    if (data.visitorSource === 'QUICK' && !data.quickVisitorName?.trim()) {
      throw new Error('El nombre del visitante es requerido')
    }
    if (data.type === 'RECURRING' && data.startDate && data.endDate) {
      if (data.endDate <= data.startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio')
      }
    }
    return this.authorizationRepository.create(data)
  }
}
