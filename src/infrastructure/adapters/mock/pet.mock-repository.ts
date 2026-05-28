import type { PetRepositoryPort } from '@/core/domain/ports/pet.repository.port'
import type { Pet, PetFilters, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { MOCK_PETS } from '../data/pets.data'
import { MOCK_RESIDENTS } from '../data/residents.data'
import { simulateDelay, generateId } from './base-mock.repository'
import { classifyBreed, isPotentiallyDangerous, requiresSpecialPermit } from '@/shared/constants/pet-breeds'

export class PetMockRepository implements PetRepositoryPort {
  private pets: Pet[] = [...MOCK_PETS]

  async findAll(filters: PetFilters): Promise<Pet[]> {
    await simulateDelay()
    return this.pets.filter(p => {
      if (filters.propertyId && p.propertyId !== filters.propertyId) return false
      if (filters.residentId && p.residentId !== filters.residentId) return false
      if (filters.type && p.type !== filters.type) return false
      if (filters.isActive !== undefined && p.isActive !== filters.isActive) return false
      if (filters.isPotentiallyDangerous !== undefined && p.isPotentiallyDangerous !== filters.isPotentiallyDangerous)
        return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.residentName.toLowerCase().includes(q)) return false
      }
      return true
    })
  }

  async findById(id: string): Promise<Pet | null> {
    await simulateDelay()
    return this.pets.find(p => p.id === id) ?? null
  }

  async findByResident(residentId: string): Promise<Pet[]> {
    await simulateDelay()
    return this.pets.filter(p => p.residentId === residentId)
  }

  async create(data: CreatePetDto): Promise<Pet> {
    await simulateDelay()
    const resident = MOCK_RESIDENTS.find(r => r.id === data.residentId)
    const pet: Pet = {
      id: generateId('pet'),
      name: data.name,
      type: data.type,
      breed: data.breed ?? null,
      breedClassification: classifyBreed(data.breed),
      color: data.color ?? null,
      size: data.size ?? null,
      weight: data.weight ?? null,
      observations: data.observations ?? null,
      residentId: data.residentId,
      residentName: resident?.name.full ?? '',
      unitId: data.unitId,
      unitNumber: resident?.unitNumber ?? '',
      propertyId: data.propertyId,
      isActive: true,
      vaccinationDate: data.vaccinationDate ?? null,
      vaccinationExpiry: data.vaccinationExpiry ?? null,
      healthCertificateNumber: data.healthCertificateNumber ?? null,
      healthCertificateExpiry: data.healthCertificateExpiry ?? null,
      isPotentiallyDangerous: isPotentiallyDangerous(data.breed),
      requiresSpecialPermit: requiresSpecialPermit(data.breed),
      insurancePolicyNumber: data.insurancePolicyNumber ?? null,
      insuranceExpiry: data.insuranceExpiry ?? null,
      municipalRegistrationNumber: data.municipalRegistrationNumber ?? null,
      municipalRegistrationExpiry: data.municipalRegistrationExpiry ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.pets.push(pet)
    return pet
  }

  async update(id: string, data: UpdatePetDto): Promise<Pet> {
    await simulateDelay()
    const idx = this.pets.findIndex(p => p.id === id)
    if (idx === -1) throw new Error(`Mascota ${id} no encontrada`)
    const current = this.pets[idx]
    const breed = data.breed !== undefined ? data.breed : current.breed
    const updated: Pet = {
      ...current,
      ...data,
      breedClassification: classifyBreed(breed),
      isPotentiallyDangerous: isPotentiallyDangerous(breed),
      requiresSpecialPermit: requiresSpecialPermit(breed),
      updatedAt: new Date(),
    }
    this.pets[idx] = updated
    return updated
  }

  async toggleStatus(id: string): Promise<Pet> {
    await simulateDelay()
    const idx = this.pets.findIndex(p => p.id === id)
    if (idx === -1) throw new Error(`Mascota ${id} no encontrada`)
    this.pets[idx] = { ...this.pets[idx], isActive: !this.pets[idx].isActive, updatedAt: new Date() }
    return this.pets[idx]
  }
}
