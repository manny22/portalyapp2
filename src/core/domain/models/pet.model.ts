export interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  color: string
  residentId: string
  propertyId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PetFilters {
  residentId?: string
  propertyId?: string
}

export interface CreatePetDto {
  name: string
  species: string
  breed?: string
  color: string
  residentId: string
  propertyId: string
}

export interface UpdatePetDto {
  name?: string
  species?: string
  breed?: string
  color?: string
  isActive?: boolean
}
