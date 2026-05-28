import type { LicensePlate } from '../value-objects/license-plate.vo'
import type { ParkingSpotType } from './parking-spot.model'

export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'BICYCLE' | 'OTHER'

export type VehicleOwnerType = 'RESIDENT' | 'VISITOR'

export interface Vehicle {
  id: string
  plate: LicensePlate
  type: VehicleType
  brand: string | null
  model: string | null
  color: string | null
  ownerType: VehicleOwnerType
  // Propietario residente (cuando ownerType === 'RESIDENT')
  residentId: string | null
  residentName: string | null
  unitId: string | null
  unitNumber: string | null
  // Propietario visitante (cuando ownerType === 'VISITOR')
  visitorId: string | null
  visitorName: string | null
  propertyId: string
  // Parqueadero asignado
  parkingSpotId: string | null
  parkingSpotCode: string | null
  parkingSpotType: ParkingSpotType | null
  // Solo aplica a visitantes en parqueadero común
  hasCommonParkingAuthorization: boolean
  commonParkingAuthorizationRef: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VehicleFilters {
  search?: string
  type?: VehicleType
  ownerType?: VehicleOwnerType
  residentId?: string
  isActive?: boolean
  propertyId?: string
}

export interface CreateVehicleDto {
  plate: string
  type: VehicleType
  brand?: string
  model?: string
  color?: string
  ownerType: VehicleOwnerType
  residentId?: string
  visitorId?: string
  visitorName?: string
  unitId?: string
  propertyId: string
  parkingSpotId?: string
  hasCommonParkingAuthorization?: boolean
  commonParkingAuthorizationRef?: string
}

export interface UpdateVehicleDto {
  brand?: string
  model?: string
  color?: string
  isActive?: boolean
  parkingSpotId?: string | null
  hasCommonParkingAuthorization?: boolean
  commonParkingAuthorizationRef?: string | null
}
