import type { PetRepositoryPort } from '@/core/domain/ports/pet.repository.port'
import type { Pet, PetFilters } from '@/core/domain/models/pet.model'

export class GetPetsUseCase {
  constructor(private readonly petRepository: PetRepositoryPort) {}

  async execute(filters: PetFilters): Promise<Pet[]> {
    return this.petRepository.findAll(filters)
  }
}
