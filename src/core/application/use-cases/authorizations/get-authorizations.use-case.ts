import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { VisitAuthorization, AuthorizationFilters } from '@/core/domain/models/visit-authorization.model'

export class GetAuthorizationsUseCase {
  constructor(private readonly authorizationRepository: AuthorizationRepositoryPort) {}

  async execute(filters: AuthorizationFilters): Promise<VisitAuthorization[]> {
    return this.authorizationRepository.findAll(filters)
  }
}
