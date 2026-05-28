import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { VisitAuthorization } from '@/core/domain/models/visit-authorization.model'

export class CancelAuthorizationUseCase {
  constructor(private readonly authorizationRepository: AuthorizationRepositoryPort) {}

  async execute(id: string): Promise<VisitAuthorization> {
    const authorization = await this.authorizationRepository.findById(id)
    if (!authorization) throw new Error(`Autorización ${id} no encontrada`)
    if (authorization.status === 'CANCELLED') throw new Error('La autorización ya está cancelada')
    if (authorization.status === 'USED') throw new Error('No se puede cancelar una autorización ya utilizada')
    return this.authorizationRepository.cancel(id)
  }
}
