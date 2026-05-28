import type { Resident, ResidentFilters, CreateResidentDto, UpdateResidentDto } from '../models/resident.model'

export interface ResidentRepositoryPort {
  findAll(filters: ResidentFilters): Promise<Resident[]>
  findById(id: string): Promise<Resident | null>
  findByUnit(unitId: string): Promise<Resident[]>
  create(data: CreateResidentDto): Promise<Resident>
  update(id: string, data: UpdateResidentDto): Promise<Resident>
  toggleStatus(id: string): Promise<Resident>
  existsByDocument(documentNumber: string, propertyId: string, excludeId?: string): Promise<boolean>
}
