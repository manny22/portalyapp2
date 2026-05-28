export type PetType = 'DOG' | 'CAT' | 'BIRD' | 'OTHER'

export type PetSize = 'SMALL' | 'MEDIUM' | 'LARGE'

export type BreedClassification = 'STANDARD' | 'SPECIAL_PERMIT' | 'PROHIBITED'

export interface Pet {
  id: string
  name: string
  type: PetType
  breed: string | null
  breedClassification: BreedClassification
  color: string | null
  size: PetSize | null
  weight: number | null
  observations: string | null
  residentId: string
  residentName: string
  unitId: string
  unitNumber: string
  propertyId: string
  isActive: boolean
  // Ley 746 de 2002 — Salud y vacunación
  vaccinationDate: Date | null
  vaccinationExpiry: Date | null
  healthCertificateNumber: string | null
  healthCertificateExpiry: Date | null
  // Ley 746 de 2002 — Razas potencialmente peligrosas
  isPotentiallyDangerous: boolean
  requiresSpecialPermit: boolean
  insurancePolicyNumber: string | null
  insuranceExpiry: Date | null
  municipalRegistrationNumber: string | null
  municipalRegistrationExpiry: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PetFilters {
  search?: string
  type?: PetType
  residentId?: string
  isActive?: boolean
  propertyId?: string
  isPotentiallyDangerous?: boolean
}

export interface CreatePetDto {
  name: string
  type: PetType
  breed?: string
  color?: string
  size?: PetSize
  weight?: number
  observations?: string
  residentId: string
  unitId: string
  propertyId: string
  vaccinationDate?: Date
  vaccinationExpiry?: Date
  healthCertificateNumber?: string
  healthCertificateExpiry?: Date
  insurancePolicyNumber?: string
  insuranceExpiry?: Date
  municipalRegistrationNumber?: string
  municipalRegistrationExpiry?: Date
}

export interface UpdatePetDto {
  name?: string
  type?: PetType
  breed?: string
  color?: string
  size?: PetSize
  weight?: number
  observations?: string
  isActive?: boolean
  vaccinationDate?: Date
  vaccinationExpiry?: Date
  healthCertificateNumber?: string
  healthCertificateExpiry?: Date
  insurancePolicyNumber?: string
  insuranceExpiry?: Date
  municipalRegistrationNumber?: string
  municipalRegistrationExpiry?: Date
}
