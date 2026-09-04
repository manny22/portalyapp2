import type { PetRepositoryPort } from '@/core/domain/ports/pet.repository.port'
import type { Pet, PetFilters, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { httpClient } from './base-http-client'

export class PetHttpRepository implements PetRepositoryPort {
  async findAll(filters: PetFilters): Promise<Pet[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.residentId) params.residentId = filters.residentId

    return httpClient.get<Pet[]>('/pets', { params })
  }

  async findById(id: string): Promise<Pet | null> {
    try {
      return await httpClient.get<Pet>(`/pets/${id}`)
    } catch {
      return null
    }
  }

  async findByResident(residentId: string): Promise<Pet[]> {
    try {
      return await httpClient.get<Pet[]>(`/pets/resident/${residentId}`)
    } catch {
      return []
    }
  }

  async create(data: CreatePetDto): Promise<Pet> {
    return httpClient.post<Pet>('/pets', data)
  }

  async update(id: string, data: UpdatePetDto): Promise<Pet> {
    return httpClient.patch<Pet>(`/pets/${id}`, data)
  }

  async toggleStatus(id: string): Promise<Pet> {
    return httpClient.patch<Pet>(`/pets/${id}/toggle-status`, {})
  }
}
