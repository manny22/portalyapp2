import type { Pet, PetFilters, CreatePetDto, UpdatePetDto } from '../models/pet.model'

export interface PetRepositoryPort {
  findAll(filters: PetFilters): Promise<Pet[]>
  findById(id: string): Promise<Pet | null>
  findByResident(residentId: string): Promise<Pet[]>
  create(data: CreatePetDto): Promise<Pet>
  update(id: string, data: UpdatePetDto): Promise<Pet>
  toggleStatus(id: string): Promise<Pet>
}
