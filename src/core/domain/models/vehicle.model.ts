export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'BICYCLE' | 'TRUCK' | 'OTHER'

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  color: string
  type: VehicleType
  residentId: string
  propertyId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VehicleFilters {
  residentId?: string
  propertyId?: string
}

export interface CreateVehicleDto {
  plate: string
  brand: string
  model: string
  color: string
  type: VehicleType
  residentId: string
  propertyId: string
}

export interface UpdateVehicleDto {
  plate?: string
  brand?: string
  model?: string
  color?: string
  type?: VehicleType
  residentId?: string
  isActive?: boolean
}
