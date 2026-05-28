export type PersonType = 'RESIDENT' | 'VISITOR' | 'SERVICE_PROVIDER' | 'DELIVERY' | 'STAFF'
export type AccessStatus = 'ENTERED' | 'EXITED'

export interface AccessLog {
  id: string
  personType: PersonType
  status: AccessStatus
  enteredAt: Date
  exitedAt: Date | null
  visitorId: string | null
  visitorName: string | null
  residentId: string | null
  residentName: string | null
  vehiclePlate: string | null
  authorizationId: string | null
  authorizationCode: string | null
  unitId: string | null
  unitNumber: string | null
  visitReason: string | null
  observations: string | null
  guardId: string
  guardName: string
  propertyId: string
  createdAt: Date
}

export interface AccessLogFilters {
  status?: AccessStatus
  personType?: PersonType
  dateFrom?: Date
  dateTo?: Date
  propertyId?: string
  search?: string
}

export interface RegisterEntryDto {
  personType: PersonType
  visitorId?: string
  residentId?: string
  vehiclePlate?: string
  authorizationId?: string
  unitId?: string
  visitReason?: string
  observations?: string
  guardId: string
  propertyId: string
}

export interface RegisterExitDto {
  accessLogId: string
  guardId: string
}
