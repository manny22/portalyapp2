import type { ResidentialBlock, ResidentialBlockFilters, CreateResidentialBlockDto, UpdateResidentialBlockDto } from '@/core/domain/models/residential-block.model'

export interface ResidentialBlockRepositoryPort {
  findAll(filters: ResidentialBlockFilters): Promise<ResidentialBlock[]>
  findById(id: string): Promise<ResidentialBlock | null>
  create(data: CreateResidentialBlockDto): Promise<ResidentialBlock>
  update(id: string, data: UpdateResidentialBlockDto): Promise<ResidentialBlock>
  delete(id: string): Promise<void>
}
