import type { AccessLog } from '../models/access-log.model'
import type { Resident } from '../models/resident.model'
import type { Vehicle } from '../models/vehicle.model'
import type { Pet } from '../models/pet.model'
import type { Visitor } from '../models/visitor.model'

export interface ReportFilters {
  dateFrom: Date
  dateTo: Date
  propertyId: string
}

export interface DashboardMetrics {
  activeResidents: number
  visitorsToday: number
  peopleInside: number
  registeredVehicles: number
  registeredPets: number
  activeAuthorizations: number
}

export interface ReportsRepositoryPort {
  getDashboardMetrics(propertyId: string): Promise<DashboardMetrics>
  getAccessLogs(filters: ReportFilters): Promise<AccessLog[]>
  getActiveResidents(propertyId: string): Promise<Resident[]>
  getRegisteredVehicles(propertyId: string): Promise<Vehicle[]>
  getRegisteredPets(propertyId: string): Promise<Pet[]>
  getFrequentVisitors(filters: ReportFilters): Promise<{ visitor: Visitor; visitCount: number }[]>
}
