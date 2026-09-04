export type AccessType = 'ENTRY' | 'EXIT'

export interface AccessLog {
  id: string
  type: AccessType
  propertyId: string
  guardId: string
  visitorId?: string
  residentId?: string
  vehicleId?: string
  petId?: string
  authorizationId?: string
  notes?: string
  createdAt: Date
}

export interface AccessLogFilters {
  propertyId?: string
}

export interface RegisterEntryDto {
  type: 'ENTRY'
  propertyId: string
  residentId?: string
  visitorId?: string
  vehicleId?: string
  petId?: string
  authorizationId?: string
  notes?: string
}

export interface RegisterExitDto {
  type: 'EXIT'
  propertyId: string
  residentId?: string
  visitorId?: string
  vehicleId?: string
  petId?: string
  notes?: string
}
