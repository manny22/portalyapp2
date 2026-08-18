import type { ResidentialUnitRepositoryPort } from '@/core/domain/ports/residential-unit.repository.port'
import type { ResidentialUnit, ResidentialUnitFilters, CreateResidentialUnitDto, UpdateResidentialUnitDto } from '@/core/domain/models/residential-unit.model'
import { httpClient } from './base-http-client'

export class ResidentialUnitHttpRepository implements ResidentialUnitRepositoryPort {
  async findAll(filters: ResidentialUnitFilters): Promise<ResidentialUnit[]> {
    const params: Record<string, string> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.blockId) params.blockId = filters.blockId

    return httpClient.get<ResidentialUnit[]>('/residential-units', { params })
  }

  async findById(id: string): Promise<ResidentialUnit | null> {
    try {
      return await httpClient.get<ResidentialUnit>(`/residential-units/${id}`)
    } catch {
      return null
    }
  }

  async create(data: CreateResidentialUnitDto): Promise<ResidentialUnit> {
    return httpClient.post<ResidentialUnit>('/residential-units', data)
  }

  async update(id: string, data: UpdateResidentialUnitDto): Promise<ResidentialUnit> {
    return httpClient.patch<ResidentialUnit>(`/residential-units/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/residential-units/${id}`)
  }
}
