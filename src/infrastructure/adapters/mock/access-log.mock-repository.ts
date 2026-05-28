import type { AccessLogRepositoryPort } from '@/core/domain/ports/access-log.repository.port'
import type { AccessLog, AccessLogFilters, RegisterEntryDto, RegisterExitDto } from '@/core/domain/models/access-log.model'
import { MOCK_ACCESS_LOGS } from '../data/access-logs.data'
import { MOCK_VISITORS } from '../data/visitors.data'
import { MOCK_RESIDENTS } from '../data/residents.data'
import { MOCK_UNITS } from '../data/properties.data'
import { MOCK_USERS } from '../data/users.data'
import { simulateDelay, generateId } from './base-mock.repository'

export class AccessLogMockRepository implements AccessLogRepositoryPort {
  private logs: AccessLog[] = [...MOCK_ACCESS_LOGS]

  async findAll(filters: AccessLogFilters): Promise<AccessLog[]> {
    await simulateDelay()
    return this.logs.filter(log => {
      if (filters.propertyId && log.propertyId !== filters.propertyId) return false
      if (filters.status && log.status !== filters.status) return false
      if (filters.personType && log.personType !== filters.personType) return false
      if (filters.dateFrom && log.enteredAt < filters.dateFrom) return false
      if (filters.dateTo && log.enteredAt > filters.dateTo) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const nameMatch = (log.visitorName ?? log.residentName ?? '').toLowerCase().includes(q)
        const plateMatch = (log.vehiclePlate ?? '').toLowerCase().includes(q)
        if (!nameMatch && !plateMatch) return false
      }
      return true
    })
  }

  async findById(id: string): Promise<AccessLog | null> {
    await simulateDelay()
    return this.logs.find(l => l.id === id) ?? null
  }

  async findPeopleInside(propertyId: string): Promise<AccessLog[]> {
    await simulateDelay()
    return this.logs.filter(l => l.propertyId === propertyId && l.status === 'ENTERED')
  }

  async findActiveEntryByPerson(visitorId: string, propertyId: string): Promise<AccessLog | null> {
    await simulateDelay()
    return (
      this.logs.find(
        l => l.visitorId === visitorId && l.propertyId === propertyId && l.status === 'ENTERED'
      ) ?? null
    )
  }

  async findActiveEntryByResident(residentId: string, propertyId: string): Promise<AccessLog | null> {
    await simulateDelay()
    return (
      this.logs.find(
        l => l.residentId === residentId && l.propertyId === propertyId && l.status === 'ENTERED'
      ) ?? null
    )
  }

  async registerEntry(data: RegisterEntryDto): Promise<AccessLog> {
    await simulateDelay()
    const visitor = data.visitorId ? MOCK_VISITORS.find(v => v.id === data.visitorId) : null
    const resident = data.residentId ? MOCK_RESIDENTS.find(r => r.id === data.residentId) : null
    const unit = data.unitId ? MOCK_UNITS.find(u => u.id === data.unitId) : null
    const guard = MOCK_USERS.find(u => u.id === data.guardId)

    // For quick visitors, extract name from observations field
    let visitorName: string | null = visitor?.name.full ?? null
    if (!visitorName && data.observations?.startsWith('Visitante rápido: ')) {
      visitorName = data.observations.replace('Visitante rápido: ', '')
    }

    const log: AccessLog = {
      id: generateId('log'),
      personType: data.personType,
      status: 'ENTERED',
      enteredAt: new Date(),
      exitedAt: null,
      visitorId: data.visitorId ?? null,
      visitorName,
      residentId: data.residentId ?? null,
      residentName: resident?.name.full ?? null,
      vehiclePlate: data.vehiclePlate ?? null,
      authorizationId: data.authorizationId ?? null,
      authorizationCode: null,
      unitId: data.unitId ?? null,
      unitNumber: unit?.number ?? null,
      visitReason: data.visitReason ?? null,
      observations: data.observations ?? null,
      guardId: data.guardId,
      guardName: guard?.name.full ?? '',
      propertyId: data.propertyId,
      createdAt: new Date(),
    }
    this.logs.push(log)
    return log
  }

  async registerExit(data: RegisterExitDto): Promise<AccessLog> {
    await simulateDelay()
    const idx = this.logs.findIndex(l => l.id === data.accessLogId)
    if (idx === -1) throw new Error(`Registro de acceso ${data.accessLogId} no encontrado`)
    if (this.logs[idx].status === 'EXITED') throw new Error('Esta persona ya registró salida')
    this.logs[idx] = { ...this.logs[idx], status: 'EXITED', exitedAt: new Date() }
    return this.logs[idx]
  }
}
