import type { VehicleRepositoryPort } from '@/core/domain/ports/vehicle.repository.port'
import type { Vehicle, VehicleFilters, CreateVehicleDto, UpdateVehicleDto } from '@/core/domain/models/vehicle.model'
import type { ParkingSpot, ParkingSpotFilters } from '@/core/domain/models/parking-spot.model'
import { LicensePlate } from '@/core/domain/value-objects/license-plate.vo'
import { MOCK_VEHICLES } from '../data/vehicles.data'
import { MOCK_RESIDENTS } from '../data/residents.data'
import { MOCK_VISITORS } from '../data/visitors.data'
import { MOCK_PARKING_SPOTS } from '../data/parking-spots.data'
import { simulateDelay, generateId } from './base-mock.repository'

export class VehicleMockRepository implements VehicleRepositoryPort {
  private vehicles: Vehicle[] = [...MOCK_VEHICLES]
  private parkingSpots: ParkingSpot[] = [...MOCK_PARKING_SPOTS]

  async findAll(filters: VehicleFilters): Promise<Vehicle[]> {
    await simulateDelay()
    return this.vehicles.filter(v => {
      if (filters.propertyId && v.propertyId !== filters.propertyId) return false
      if (filters.residentId && v.residentId !== filters.residentId) return false
      if (filters.ownerType && v.ownerType !== filters.ownerType) return false
      if (filters.type && v.type !== filters.type) return false
      if (filters.isActive !== undefined && v.isActive !== filters.isActive) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const ownerName = v.ownerType === 'RESIDENT' ? (v.residentName ?? '') : (v.visitorName ?? '')
        if (
          !v.plate.value.toLowerCase().includes(q) &&
          !ownerName.toLowerCase().includes(q) &&
          !(v.brand ?? '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }

  async findById(id: string): Promise<Vehicle | null> {
    await simulateDelay()
    return this.vehicles.find(v => v.id === id) ?? null
  }

  async findByResident(residentId: string): Promise<Vehicle[]> {
    await simulateDelay()
    return this.vehicles.filter(v => v.residentId === residentId)
  }

  async findParkingSpots(filters: ParkingSpotFilters): Promise<ParkingSpot[]> {
    await simulateDelay()
    return this.parkingSpots.filter(s => {
      if (filters.propertyId && s.propertyId !== filters.propertyId) return false
      if (filters.type && s.type !== filters.type) return false
      if (filters.isOccupied !== undefined && s.isOccupied !== filters.isOccupied) return false
      if (filters.unitId && s.unitId !== filters.unitId) return false
      return true
    })
  }

  async create(data: CreateVehicleDto): Promise<Vehicle> {
    await simulateDelay()

    const resident = data.residentId ? MOCK_RESIDENTS.find(r => r.id === data.residentId) : null
    const visitor = data.visitorId ? MOCK_VISITORS.find(v => v.id === data.visitorId) : null

    // Assign parking spot
    let parkingSpot: ParkingSpot | null = null
    if (data.parkingSpotId) {
      const idx = this.parkingSpots.findIndex(s => s.id === data.parkingSpotId)
      if (idx !== -1 && !this.parkingSpots[idx].isOccupied) {
        parkingSpot = this.parkingSpots[idx]
      }
    }

    const vehicle: Vehicle = {
      id: generateId('veh'),
      plate: LicensePlate.create(data.plate),
      type: data.type,
      brand: data.brand ?? null,
      model: data.model ?? null,
      color: data.color ?? null,
      ownerType: data.ownerType,
      residentId: resident?.id ?? null,
      residentName: resident?.name.full ?? null,
      visitorId: visitor?.id ?? null,
      visitorName: visitor?.name.full ?? (data.visitorName ?? null),
      unitId: resident?.unitId ?? null,
      unitNumber: resident?.unitNumber ?? null,
      propertyId: data.propertyId,
      parkingSpotId: parkingSpot?.id ?? null,
      parkingSpotCode: parkingSpot?.code ?? null,
      parkingSpotType: parkingSpot?.type ?? null,
      hasCommonParkingAuthorization: data.hasCommonParkingAuthorization ?? false,
      commonParkingAuthorizationRef: data.commonParkingAuthorizationRef ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Mark spot as occupied
    if (parkingSpot) {
      const idx = this.parkingSpots.findIndex(s => s.id === parkingSpot!.id)
      this.parkingSpots[idx] = {
        ...this.parkingSpots[idx],
        isOccupied: true,
        currentVehicleId: vehicle.id,
        currentVehiclePlate: vehicle.plate.format(),
        updatedAt: new Date(),
      }
    }

    this.vehicles.push(vehicle)
    return vehicle
  }

  async update(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    await simulateDelay()
    const idx = this.vehicles.findIndex(v => v.id === id)
    if (idx === -1) throw new Error(`Vehículo ${id} no encontrado`)
    const current = this.vehicles[idx]

    // Handle parking spot change
    if (data.parkingSpotId !== undefined && data.parkingSpotId !== current.parkingSpotId) {
      // Release previous spot
      if (current.parkingSpotId) {
        const prevIdx = this.parkingSpots.findIndex(s => s.id === current.parkingSpotId)
        if (prevIdx !== -1) {
          this.parkingSpots[prevIdx] = {
            ...this.parkingSpots[prevIdx],
            isOccupied: false,
            currentVehicleId: null,
            currentVehiclePlate: null,
            updatedAt: new Date(),
          }
        }
      }
      // Occupy new spot
      if (data.parkingSpotId) {
        const newIdx = this.parkingSpots.findIndex(s => s.id === data.parkingSpotId)
        if (newIdx !== -1) {
          this.parkingSpots[newIdx] = {
            ...this.parkingSpots[newIdx],
            isOccupied: true,
            currentVehicleId: id,
            currentVehiclePlate: current.plate.format(),
            updatedAt: new Date(),
          }
        }
      }
    }

    const newSpot = data.parkingSpotId !== undefined
      ? this.parkingSpots.find(s => s.id === data.parkingSpotId) ?? null
      : null

    const updated: Vehicle = {
      ...current,
      brand: data.brand !== undefined ? (data.brand ?? null) : current.brand,
      model: data.model !== undefined ? (data.model ?? null) : current.model,
      color: data.color !== undefined ? (data.color ?? null) : current.color,
      isActive: data.isActive !== undefined ? data.isActive : current.isActive,
      parkingSpotId: data.parkingSpotId !== undefined ? (data.parkingSpotId ?? null) : current.parkingSpotId,
      parkingSpotCode: data.parkingSpotId !== undefined ? (newSpot?.code ?? null) : current.parkingSpotCode,
      parkingSpotType: data.parkingSpotId !== undefined ? (newSpot?.type ?? null) : current.parkingSpotType,
      hasCommonParkingAuthorization:
        data.hasCommonParkingAuthorization !== undefined
          ? data.hasCommonParkingAuthorization
          : current.hasCommonParkingAuthorization,
      commonParkingAuthorizationRef:
        data.commonParkingAuthorizationRef !== undefined
          ? data.commonParkingAuthorizationRef
          : current.commonParkingAuthorizationRef,
      updatedAt: new Date(),
    }

    this.vehicles[idx] = updated
    return updated
  }

  async toggleStatus(id: string): Promise<Vehicle> {
    await simulateDelay()
    const idx = this.vehicles.findIndex(v => v.id === id)
    if (idx === -1) throw new Error(`Vehículo ${id} no encontrado`)
    this.vehicles[idx] = { ...this.vehicles[idx], isActive: !this.vehicles[idx].isActive, updatedAt: new Date() }
    return this.vehicles[idx]
  }

  async existsByPlate(plate: string, propertyId: string, excludeId?: string): Promise<boolean> {
    await simulateDelay()
    const normalized = LicensePlate.normalize(plate)
    return this.vehicles.some(
      v => v.plate.value === normalized && v.propertyId === propertyId && v.id !== excludeId,
    )
  }
}
