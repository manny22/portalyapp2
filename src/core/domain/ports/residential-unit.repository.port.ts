import type { ResidentialUnit, ResidentialUnitFilters, CreateResidentialUnitDto, UpdateResidentialUnitDto } from '@/core/domain/models/residential-unit.model'

export interface ResidentialUnitRepositoryPort {
  findAll(filters: ResidentialUnitFilters): Promise<ResidentialUnit[]>
  findById(id: string): Promise<ResidentialUnit | null>
  create(data: CreateResidentialUnitDto): Promise<ResidentialUnit>
  update(id: string, data: UpdateResidentialUnitDto): Promise<ResidentialUnit>
  delete(id: string): Promise<void>
}
