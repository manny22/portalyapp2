import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident, ResidentFilters } from '@/core/domain/models/resident.model'

export class GetResidentsUseCase {
  constructor(private readonly residentRepository: ResidentRepositoryPort) {}

  async execute(filters: ResidentFilters): Promise<Resident[]> {
    return this.residentRepository.findAll(filters)
  }
}
