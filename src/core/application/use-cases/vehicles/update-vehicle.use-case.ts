import type { VehicleRepositoryPort } from '@/core/domain/ports/vehicle.repository.port'
import type { Vehicle, UpdateVehicleDto } from '@/core/domain/models/vehicle.model'

export class UpdateVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    const exists = await this.vehicleRepository.findById(id)
    if (!exists) throw new Error(`Vehículo ${id} no encontrado`)
    return this.vehicleRepository.update(id, data)
  }
}
