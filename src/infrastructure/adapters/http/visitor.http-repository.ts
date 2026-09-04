import type { VisitorRepositoryPort } from '@/core/domain/ports/visitor.repository.port'
import type {
  Visitor,
  VisitorFilters,
  CreateVisitorDto,
  UpdateVisitorDto,
} from '@/core/domain/models/visitor.model'
import { httpClient } from './base-http-client'

export class VisitorHttpRepository implements VisitorRepositoryPort {
  async findAll(filters: VisitorFilters): Promise<Visitor[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.documentNumber) params.documentNumber = filters.documentNumber

    return httpClient.get<Visitor[]>('/visitors', { params })
  }

  async findById(id: string): Promise<Visitor | null> {
    try {
      return await httpClient.get<Visitor>(`/visitors/${id}`)
    } catch {
      return null
    }
  }

  async findByDocument(documentNumber: string): Promise<Visitor | null> {
    try {
      return await httpClient.get<Visitor>(`/visitors/document/${documentNumber}`)
    } catch {
      return null
    }
  }

  async create(data: CreateVisitorDto): Promise<Visitor> {
    return httpClient.post<Visitor>('/visitors', data)
  }

  async update(id: string, data: UpdateVisitorDto): Promise<Visitor> {
    return httpClient.patch<Visitor>(`/visitors/${id}`, data)
  }
}
