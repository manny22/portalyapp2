export type AuthorizationStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'

export interface VisitAuthorization {
  id: string
  visitorId: string
  residentId: string
  unitId: string
  propertyId: string
  authorizedById: string
  validFrom: Date
  validUntil: Date
  status: AuthorizationStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthorizationFilters {
  propertyId?: string
  residentId?: string
  visitorId?: string
  status?: AuthorizationStatus
}

export interface CreateAuthorizationDto {
  visitorId: string
  residentId: string
  unitId: string
  propertyId: string
  authorizedById: string
  validFrom: string
  validUntil: string
  notes?: string
}
