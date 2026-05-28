import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident } from '@/core/domain/models/resident.model'

export class GetResidentUseCase {
  constructor(private readonly residentRepository: ResidentRepositoryPort) {}

  async execute(id: string): Promise<Resident> {
    const resident = await this.residentRepository.findById(id)
    if (!resident) throw new Error(`Residente ${id} no encontrado`)
    return resident
  }
}
