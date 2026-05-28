import type { AuthorizationCode } from '../value-objects/authorization-code.vo'
import type { DateRange } from '../value-objects/date-range.vo'

export type AuthorizationType = 'ONE_TIME' | 'RECURRING' | 'PERMANENT'
export type AuthorizationStatus = 'PENDING' | 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED'
export type VisitorSourceType = 'EXISTING' | 'QUICK'
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface VisitAuthorization {
  id: string
  code: AuthorizationCode
  type: AuthorizationType
  status: AuthorizationStatus
  validityPeriod: DateRange | null
  entryDate: string | null        // 'YYYY-MM-DD' for ONE_TIME
  entryTime: string | null        // 'HH:MM' for ONE_TIME
  allowedDays: DayOfWeek[]        // for RECURRING
  allowedTimeStart: string | null // 'HH:MM' for RECURRING
  allowedTimeEnd: string | null   // 'HH:MM' for RECURRING
  visitorSource: VisitorSourceType
  residentId: string
  residentName: string
  visitorId: string | null
  visitorName: string
  visitorDocument: string
  unitId: string
  unitNumber: string
  propertyId: string
  observations: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthorizationFilters {
  search?: string
  status?: AuthorizationStatus
  residentId?: string
  visitorId?: string
  propertyId?: string
}

export interface CreateAuthorizationDto {
  type: AuthorizationType
  // ONE_TIME fields
  entryDate?: string
  entryTime?: string
  // RECURRING fields
  startDate?: Date
  endDate?: Date
  allowedDays?: DayOfWeek[]
  allowedTimeStart?: string
  allowedTimeEnd?: string
  // Resident / unit
  residentId: string
  unitId: string
  propertyId: string
  // Visitor source
  visitorSource: VisitorSourceType
  visitorId?: string              // if EXISTING
  quickVisitorName?: string       // if QUICK
  quickVisitorCompany?: string    // if QUICK
  observations?: string
}
