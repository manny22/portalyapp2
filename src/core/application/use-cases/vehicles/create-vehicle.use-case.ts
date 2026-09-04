import type { VehicleRepositoryPort } from '@/core/domain/ports/vehicle.repository.port'
import type { Vehicle, CreateVehicleDto } from '@/core/domain/models/vehicle.model'

export class CreateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(data: CreateVehicleDto): Promise<Vehicle> {
    const plateExists = await this.vehicleRepository.existsByPlate(data.plate, data.propertyId)
    if (plateExists) {
      throw new Error(`La placa ${data.plate} ya está registrada en esta copropiedad`)
    }
    return this.vehicleRepository.create(data)
  }
}
