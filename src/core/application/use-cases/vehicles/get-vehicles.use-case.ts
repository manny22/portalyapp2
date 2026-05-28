import type { VehicleRepositoryPort } from '@/core/domain/ports/vehicle.repository.port'
import type { Vehicle, VehicleFilters } from '@/core/domain/models/vehicle.model'

export class GetVehiclesUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryPort) {}

  async execute(filters: VehicleFilters): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll(filters)
  }
}
