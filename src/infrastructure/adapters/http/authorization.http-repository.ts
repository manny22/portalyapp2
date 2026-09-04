import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type {
  VisitAuthorization,
  AuthorizationFilters,
  CreateAuthorizationDto,
} from '@/core/domain/models/visit-authorization.model'
import { httpClient } from './base-http-client'

export class AuthorizationHttpRepository implements AuthorizationRepositoryPort {
  async findAll(filters: AuthorizationFilters): Promise<VisitAuthorization[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId
    if (filters.residentId) params.residentId = filters.residentId
    if (filters.visitorId) params.visitorId = filters.visitorId
    if (filters.status) params.status = filters.status

    return httpClient.get<VisitAuthorization[]>('/visit-authorizations', { params })
  }

  async findById(id: string): Promise<VisitAuthorization | null> {
    try {
      return await httpClient.get<VisitAuthorization>(`/visit-authorizations/${id}`)
    } catch {
      return null
    }
  }

  async findByResident(residentId: string): Promise<VisitAuthorization[]> {
    try {
      return await httpClient.get<VisitAuthorization[]>('/visit-authorizations', {
        params: { residentId },
      })
    } catch {
      return []
    }
  }

  async create(data: CreateAuthorizationDto): Promise<VisitAuthorization> {
    return httpClient.post<VisitAuthorization>('/visit-authorizations', data)
  }

  async revoke(id: string): Promise<VisitAuthorization> {
    return httpClient.patch<VisitAuthorization>(`/visit-authorizations/${id}/revoke`, {})
  }
}
