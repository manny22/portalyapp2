import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident, ResidentFilters, CreateResidentDto, UpdateResidentDto } from '@/core/domain/models/resident.model'
import { httpClient } from './base-http-client'

export class ResidentHttpRepository implements ResidentRepositoryPort {
  async findAll(filters: ResidentFilters): Promise<Resident[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.unitId) params.unitId = filters.unitId

    return httpClient.get<Resident[]>('/residents', { params })
  }

  async findById(id: string): Promise<Resident | null> {
    try {
      return await httpClient.get<Resident>(`/residents/${id}`)
    } catch {
      return null
    }
  }

  async findByUnit(unitId: string): Promise<Resident[]> {
    return this.findAll({ unitId })
  }

  async create(data: CreateResidentDto): Promise<Resident> {
    return httpClient.post<Resident>('/residents', data)
  }

  async update(id: string, data: UpdateResidentDto): Promise<Resident> {
    return httpClient.patch<Resident>(`/residents/${id}`, data)
  }

  async toggleStatus(id: string): Promise<Resident> {
    const current = await this.findById(id)
    if (!current) throw new Error(`Residente ${id} no encontrado`)
    return this.update(id, { isActive: !current.isActive })
  }

  async existsByDocument(): Promise<boolean> {
    return false
  }
}
