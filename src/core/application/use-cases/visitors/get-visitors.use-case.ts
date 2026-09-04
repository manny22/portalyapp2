import type { VisitorRepositoryPort } from '@/core/domain/ports/visitor.repository.port'
import type { Visitor, VisitorFilters } from '@/core/domain/models/visitor.model'

export class GetVisitorsUseCase {
  constructor(private readonly visitorRepository: VisitorRepositoryPort) {}

  async execute(filters: VisitorFilters): Promise<Visitor[]> {
    return this.visitorRepository.findAll(filters)
  }
}
