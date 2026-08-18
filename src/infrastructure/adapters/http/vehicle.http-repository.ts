import type { VehicleRepositoryPort } from '@/core/domain/ports/vehicle.repository.port'
import type { Vehicle, VehicleFilters, CreateVehicleDto, UpdateVehicleDto } from '@/core/domain/models/vehicle.model'
import type { ParkingSpot, ParkingSpotFilters } from '@/core/domain/models/parking-spot.model'
import { httpClient } from './base-http-client'

export class VehicleHttpRepository implements VehicleRepositoryPort {
  async findAll(filters: VehicleFilters): Promise<Vehicle[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.residentId) params.residentId = filters.residentId

    return httpClient.get<Vehicle[]>('/vehicles', { params })
  }

  async findById(id: string): Promise<Vehicle | null> {
    try {
      return await httpClient.get<Vehicle>(`/vehicles/${id}`)
    } catch {
      return null
    }
  }

  async findByResident(residentId: string): Promise<Vehicle[]> {
    try {
      return await httpClient.get<Vehicle[]>(`/vehicles/resident/${residentId}`)
    } catch {
      return []
    }
  }

  async create(data: CreateVehicleDto): Promise<Vehicle> {
    return httpClient.post<Vehicle>('/vehicles', data)
  }

  async update(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    return httpClient.patch<Vehicle>(`/vehicles/${id}`, data)
  }

  async toggleStatus(id: string): Promise<Vehicle> {
    return httpClient.patch<Vehicle>(`/vehicles/${id}/toggle-status`, {})
  }

  async existsByPlate(): Promise<boolean> {
    return false
  }

  async findParkingSpots(filters: ParkingSpotFilters): Promise<ParkingSpot[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.type) params.type = filters.type
    if (filters.isOccupied !== undefined) params.isOccupied = filters.isOccupied
    if (filters.unitId) params.unitId = filters.unitId

    return httpClient.get<ParkingSpot[]>('/parking-spots', { params })
  }
}
