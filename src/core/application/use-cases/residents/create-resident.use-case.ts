import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident, CreateResidentDto } from '@/core/domain/models/resident.model'

export class CreateResidentUseCase {
  constructor(private readonly residentRepository: ResidentRepositoryPort) {}

  async execute(data: CreateResidentDto): Promise<Resident> {
    return this.residentRepository.create(data)
  }
}
