import type { ReportsRepositoryPort, ReportFilters, DashboardMetrics } from '@/core/domain/ports/reports.repository.port'
import type { AccessLog } from '@/core/domain/models/access-log.model'
import type { Resident } from '@/core/domain/models/resident.model'
import type { Vehicle } from '@/core/domain/models/vehicle.model'
import type { Pet } from '@/core/domain/models/pet.model'
import type { Visitor } from '@/core/domain/models/visitor.model'
import { MOCK_RESIDENTS } from '../data/residents.data'
import { MOCK_VEHICLES } from '../data/vehicles.data'
import { MOCK_PETS } from '../data/pets.data'
import { MOCK_ACCESS_LOGS } from '../data/access-logs.data'
import { MOCK_VISITORS } from '../data/visitors.data'
import { MOCK_AUTHORIZATIONS } from '../data/authorizations.data'
import { simulateDelay } from './base-mock.repository'

export class ReportsMockRepository implements ReportsRepositoryPort {
  async getDashboardMetrics(propertyId: string): Promise<DashboardMetrics> {
    await simulateDelay()
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    return {
      activeResidents: MOCK_RESIDENTS.filter(r => r.propertyId === propertyId && r.isActive).length,
      visitorsToday: MOCK_ACCESS_LOGS.filter(
        l => l.propertyId === propertyId && l.enteredAt >= startOfDay
      ).length,
      peopleInside: MOCK_ACCESS_LOGS.filter(
        l => l.propertyId === propertyId && l.status === 'ENTERED'
      ).length,
      registeredVehicles: MOCK_VEHICLES.filter(v => v.propertyId === propertyId && v.isActive).length,
      registeredPets: MOCK_PETS.filter(p => p.propertyId === propertyId && p.isActive).length,
      activeAuthorizations: MOCK_AUTHORIZATIONS.filter(
        a => a.propertyId === propertyId && a.status === 'ACTIVE'
      ).length,
    }
  }

  async getAccessLogs(filters: ReportFilters): Promise<AccessLog[]> {
    await simulateDelay()
    return MOCK_ACCESS_LOGS.filter(
      l =>
        l.propertyId === filters.propertyId &&
        l.enteredAt >= filters.dateFrom &&
        l.enteredAt <= filters.dateTo
    )
  }

  async getActiveResidents(propertyId: string): Promise<Resident[]> {
    await simulateDelay()
    return MOCK_RESIDENTS.filter(r => r.propertyId === propertyId && r.isActive)
  }

  async getRegisteredVehicles(propertyId: string): Promise<Vehicle[]> {
    await simulateDelay()
    return MOCK_VEHICLES.filter(v => v.propertyId === propertyId && v.isActive)
  }

  async getRegisteredPets(propertyId: string): Promise<Pet[]> {
    await simulateDelay()
    return MOCK_PETS.filter(p => p.propertyId === propertyId && p.isActive)
  }

  async getFrequentVisitors(filters: ReportFilters): Promise<{ visitor: Visitor; visitCount: number }[]> {
    await simulateDelay()
    const logsInRange = MOCK_ACCESS_LOGS.filter(
      l =>
        l.propertyId === filters.propertyId &&
        l.enteredAt >= filters.dateFrom &&
        l.enteredAt <= filters.dateTo &&
        l.visitorId !== null
    )
    const countMap = new Map<string, number>()
    for (const log of logsInRange) {
      if (log.visitorId) countMap.set(log.visitorId, (countMap.get(log.visitorId) ?? 0) + 1)
    }
    return Array.from(countMap.entries())
      .map(([visitorId, visitCount]) => ({
        visitor: MOCK_VISITORS.find(v => v.id === visitorId)!,
        visitCount,
      }))
      .filter(entry => entry.visitor !== undefined)
      .sort((a, b) => b.visitCount - a.visitCount)
  }
}
