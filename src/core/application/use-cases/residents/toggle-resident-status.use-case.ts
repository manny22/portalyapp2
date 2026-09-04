import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident } from '@/core/domain/models/resident.model'

export class ToggleResidentStatusUseCase {
  constructor(private readonly residentRepository: ResidentRepositoryPort) {}

  async execute(id: string): Promise<Resident> {
    const exists = await this.residentRepository.findById(id)
    if (!exists) throw new Error(`Residente ${id} no encontrado`)
    return this.residentRepository.toggleStatus(id)
  }
}
