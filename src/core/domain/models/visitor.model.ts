import type { FullName } from '../value-objects/full-name.vo'
import type { DocumentNumber } from '../value-objects/document-number.vo'
import type { PhoneNumber } from '../value-objects/phone-number.vo'

export interface Visitor {
  id: string
  name: FullName
  document: DocumentNumber
  phone: PhoneNumber | null
  company: string | null
  observations: string | null
  createdAt: Date
  updatedAt: Date
}

export interface VisitorFilters {
  search?: string
  documentNumber?: string
}

export interface CreateVisitorDto {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  phone?: string
  company?: string
  observations?: string
}

export interface UpdateVisitorDto {
  phone?: string
  company?: string
  observations?: string
}
