import type { PetRepositoryPort } from '@/core/domain/ports/pet.repository.port'
import type { Pet, UpdatePetDto } from '@/core/domain/models/pet.model'

export class UpdatePetUseCase {
  constructor(private readonly petRepository: PetRepositoryPort) {}

  async execute(id: string, data: UpdatePetDto): Promise<Pet> {
    const exists = await this.petRepository.findById(id)
    if (!exists) throw new Error(`Mascota ${id} no encontrada`)
    return this.petRepository.update(id, data)
  }
}
