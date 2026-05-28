import type { PetRepositoryPort } from '@/core/domain/ports/pet.repository.port'
import type { Pet, CreatePetDto } from '@/core/domain/models/pet.model'
import { classifyBreed } from '@/shared/constants/pet-breeds'

export class CreatePetUseCase {
  constructor(private readonly petRepository: PetRepositoryPort) {}

  async execute(data: CreatePetDto): Promise<Pet> {
    if (classifyBreed(data.breed) === 'PROHIBITED') {
      throw new Error(
        `La raza "${data.breed}" está prohibida en Colombia según la Ley 746 de 2002. No puede registrarse en el sistema.`,
      )
    }
    return this.petRepository.create(data)
  }
}
