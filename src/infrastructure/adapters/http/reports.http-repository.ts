import type {
  ReportsRepositoryPort,
  ReportFilters,
  DashboardMetrics,
} from '@/core/domain/ports/reports.repository.port'
import type { AccessLog } from '@/core/domain/models/access-log.model'
import type { Resident } from '@/core/domain/models/resident.model'
import type { Vehicle } from '@/core/domain/models/vehicle.model'
import type { Pet } from '@/core/domain/models/pet.model'
import type { Visitor } from '@/core/domain/models/visitor.model'
import { httpClient } from './base-http-client'

export class ReportsHttpRepository implements ReportsRepositoryPort {
  async getDashboardMetrics(propertyId: string): Promise<DashboardMetrics> {
    return httpClient.get<DashboardMetrics>(`/reports/dashboard-metrics/${propertyId}`)
  }

  async getAccessLogs(filters: ReportFilters): Promise<AccessLog[]> {
    const params = {
      propertyId: filters.propertyId,
      dateFrom: filters.dateFrom.toISOString(),
      dateTo: filters.dateTo.toISOString(),
    }
    return httpClient.get<AccessLog[]>('/reports/access-logs', { params })
  }

  async getActiveResidents(propertyId: string): Promise<Resident[]> {
    return httpClient.get<Resident[]>(`/reports/active-residents/${propertyId}`)
  }

  async getRegisteredVehicles(propertyId: string): Promise<Vehicle[]> {
    return httpClient.get<Vehicle[]>(`/reports/registered-vehicles/${propertyId}`)
  }

  async getRegisteredPets(propertyId: string): Promise<Pet[]> {
    return httpClient.get<Pet[]>(`/reports/registered-pets/${propertyId}`)
  }

  async getFrequentVisitors(
    filters: ReportFilters
  ): Promise<{ visitor: Visitor; visitCount: number }[]> {
    const params = {
      propertyId: filters.propertyId,
      dateFrom: filters.dateFrom.toISOString(),
      dateTo: filters.dateTo.toISOString(),
    }
    return httpClient.get<{ visitor: Visitor; visitCount: number }[]>(
      '/reports/frequent-visitors',
      {
        params,
      }
    )
  }
}
