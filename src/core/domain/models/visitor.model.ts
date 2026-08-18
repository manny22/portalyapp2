export type DocumentType = 'CC' | 'CE' | 'PASSPORT' | 'NIT' | 'TI'

export interface Visitor {
  id: string
  firstName: string
  lastName: string
  documentType: DocumentType
  documentNumber: string
  phone?: string
  propertyId: string
  createdAt: Date
  updatedAt: Date
}

export interface VisitorFilters {
  propertyId?: string
  documentNumber?: string
}

export interface CreateVisitorDto {
  firstName: string
  lastName: string
  documentType: DocumentType
  documentNumber: string
  phone?: string
  propertyId: string
}

export interface UpdateVisitorDto {
  firstName?: string
  lastName?: string
  documentType?: DocumentType
  documentNumber?: string
  phone?: string
  propertyId?: string
}
