import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident, UpdateResidentDto } from '@/core/domain/models/resident.model'

export class UpdateResidentUseCase {
  constructor(private readonly residentRepository: ResidentRepositoryPort) {}

  async execute(id: string, data: UpdateResidentDto): Promise<Resident> {
    const exists = await this.residentRepository.findById(id)
    if (!exists) throw new Error(`Residente ${id} no encontrado`)
    return this.residentRepository.update(id, data)
  }
}
