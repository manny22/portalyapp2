import type { FullName } from '../value-objects/full-name.vo'
import type { DocumentNumber } from '../value-objects/document-number.vo'
import type { Email } from '../value-objects/email.vo'
import type { PhoneNumber } from '../value-objects/phone-number.vo'

export type ResidentRelationType = 'OWNER' | 'TENANT' | 'FAMILY' | 'AUTHORIZED'

export interface Resident {
  id: string
  name: FullName
  document: DocumentNumber
  email: Email | null
  phone: PhoneNumber | null
  relation: ResidentRelationType
  observations: string | null
  unitId: string
  unitNumber: string
  blockName: string | null
  propertyId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ResidentFilters {
  search?: string
  unitId?: string
  isActive?: boolean
  propertyId?: string
}

export interface CreateResidentDto {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  email?: string
  phone?: string
  relation: ResidentRelationType
  observations?: string
  unitId: string
  propertyId: string
}

export interface UpdateResidentDto {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  relation?: ResidentRelationType
  observations?: string
  unitId?: string
}
