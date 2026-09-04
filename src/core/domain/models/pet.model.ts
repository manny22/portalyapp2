export interface Pet {
  id: string
  name: string
  type?: string
  breed?: string
  color?: string
  size?: string
  weight?: number
  vaccinationDate?: Date
  vaccinationExpiry?: Date
  healthCertificateNumber?: string
  healthCertificateExpiry?: Date
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
  type?: string
  breed?: string
  color?: string
  size?: string
  weight?: number
  vaccinationDate?: Date
  vaccinationExpiry?: Date
  healthCertificateNumber?: string
  healthCertificateExpiry?: Date
  residentId: string
  propertyId: string
}

export interface UpdatePetDto {
  name?: string
  type?: string
  breed?: string
  color?: string
  size?: string
  weight?: number
  vaccinationDate?: Date
  vaccinationExpiry?: Date
  healthCertificateNumber?: string
  healthCertificateExpiry?: Date
  isActive?: boolean
}
