import type { ResidentialBlockRepositoryPort } from '@/core/domain/ports/residential-block.repository.port'
import type { ResidentialBlock, ResidentialBlockFilters, CreateResidentialBlockDto, UpdateResidentialBlockDto } from '@/core/domain/models/residential-block.model'
import { httpClient } from './base-http-client'

export class ResidentialBlockHttpRepository implements ResidentialBlockRepositoryPort {
  async findAll(filters: ResidentialBlockFilters): Promise<ResidentialBlock[]> {
    const params: Record<string, string> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId

    return httpClient.get<ResidentialBlock[]>('/residential-blocks', { params })
  }

  async findById(id: string): Promise<ResidentialBlock | null> {
    try {
      return await httpClient.get<ResidentialBlock>(`/residential-blocks/${id}`)
    } catch {
      return null
    }
  }

  async create(data: CreateResidentialBlockDto): Promise<ResidentialBlock> {
    return httpClient.post<ResidentialBlock>('/residential-blocks', data)
  }

  async update(id: string, data: UpdateResidentialBlockDto): Promise<ResidentialBlock> {
    return httpClient.patch<ResidentialBlock>(`/residential-blocks/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`/residential-blocks/${id}`)
  }
}
