import type { VisitorRepositoryPort } from '@/core/domain/ports/visitor.repository.port'
import type { Visitor, CreateVisitorDto } from '@/core/domain/models/visitor.model'

export class CreateVisitorUseCase {
  constructor(private readonly visitorRepository: VisitorRepositoryPort) {}

  async execute(data: CreateVisitorDto): Promise<Visitor> {
    return this.visitorRepository.create(data)
  }
}
