export interface ResidentialBlock {
  id: string
  name: string
  propertyId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ResidentialBlockFilters {
  propertyId?: string
}

export interface CreateResidentialBlockDto {
  name: string
  propertyId: string
}

export interface UpdateResidentialBlockDto {
  name?: string
}
