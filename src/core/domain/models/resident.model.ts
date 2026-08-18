export interface Resident {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  unitId: string
  propertyId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ResidentFilters {
  propertyId?: string
  unitId?: string
}

export interface CreateResidentDto {
  firstName: string
  lastName: string
  email: string
  phone?: string
  unitId: string
  propertyId: string
}

export interface UpdateResidentDto {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  unitId?: string
  isActive?: boolean
}
