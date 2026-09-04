import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type {
  AccessLog,
  AccessLogFilters,
  RegisterEntryDto,
  RegisterExitDto,
} from '@/core/domain/models/access-log.model'
import { httpClient } from './base-http-client'

export class AccessLogHttpRepository implements AccessLogRepositoryPort {
  async findAll(filters: AccessLogFilters): Promise<AccessLog[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId

    return httpClient.get<AccessLog[]>('/access-logs', { params })
  }

  async findById(id: string): Promise<AccessLog | null> {
    try {
      return await httpClient.get<AccessLog>(`/access-logs/${id}`)
    } catch {
      return null
    }
  }

  async findPeopleInside(propertyId: string): Promise<AccessLog[]> {
    try {
      return await httpClient.get<AccessLog[]>('/access-logs/inside', {
        params: { propertyId },
      })
    } catch {
      return []
    }
  }

  async findActiveEntryByPerson(visitorId: string, propertyId: string): Promise<AccessLog | null> {
    try {
      const logs = await httpClient.get<AccessLog[]>('/access-logs/inside', {
        params: { propertyId },
      })
      return logs?.find(log => log.visitorId === visitorId) || null
    } catch {
      return null
    }
  }

  async findActiveEntryByResident(
    residentId: string,
    propertyId: string
  ): Promise<AccessLog | null> {
    try {
      const logs = await httpClient.get<AccessLog[]>('/access-logs/inside', {
        params: { propertyId },
      })
      return logs?.find(log => log.residentId === residentId) || null
    } catch {
      return null
    }
  }

  async registerEntry(data: RegisterEntryDto): Promise<AccessLog> {
    return httpClient.post<AccessLog>('/access-logs', { ...data, type: 'ENTRY' })
  }

  async registerExit(data: RegisterExitDto): Promise<AccessLog> {
    return httpClient.post<AccessLog>('/access-logs', { ...data, type: 'EXIT' })
  }
}
