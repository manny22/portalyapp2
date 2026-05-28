import type { Vehicle, VehicleFilters, CreateVehicleDto, UpdateVehicleDto } from '../models/vehicle.model'
import type { ParkingSpot, ParkingSpotFilters } from '../models/parking-spot.model'

export interface VehicleRepositoryPort {
  findAll(filters: VehicleFilters): Promise<Vehicle[]>
  findById(id: string): Promise<Vehicle | null>
  findByResident(residentId: string): Promise<Vehicle[]>
  create(data: CreateVehicleDto): Promise<Vehicle>
  update(id: string, data: UpdateVehicleDto): Promise<Vehicle>
  toggleStatus(id: string): Promise<Vehicle>
  existsByPlate(plate: string, propertyId: string, excludeId?: string): Promise<boolean>
  // Parking
  findParkingSpots(filters: ParkingSpotFilters): Promise<ParkingSpot[]>
}
