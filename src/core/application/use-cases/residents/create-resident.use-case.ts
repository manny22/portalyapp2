import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident, CreateResidentDto } from '@/core/domain/models/resident.model'

export class CreateResidentUseCase {
  constructor(private readonly residentRepository: ResidentRepositoryPort) {}

  async execute(data: CreateResidentDto): Promise<Resident> {
    const alreadyExists = await this.residentRepository.existsByDocument(
      data.documentNumber,
      data.propertyId
    )
    if (alreadyExists) {
      throw new Error(`Ya existe un residente con el documento ${data.documentNumber} en esta copropiedad`)
    }
    return this.residentRepository.create(data)
  }
}
