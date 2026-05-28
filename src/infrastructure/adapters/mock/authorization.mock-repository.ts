import type { AuthorizationRepositoryPort } from '@/core/domain/ports/authorization.repository.port'
import type { VisitAuthorization, AuthorizationFilters, CreateAuthorizationDto } from '@/core/domain/models/visit-authorization.model'
import { AuthorizationCode } from '@/core/domain/value-objects/authorization-code.vo'
import { DateRange } from '@/core/domain/value-objects/date-range.vo'
import { MOCK_AUTHORIZATIONS } from '../data/authorizations.data'
import { MOCK_RESIDENTS } from '../data/residents.data'
import { MOCK_VISITORS } from '../data/visitors.data'
import { MOCK_UNITS } from '../data/properties.data'
import { simulateDelay, generateId } from './base-mock.repository'

export class AuthorizationMockRepository implements AuthorizationRepositoryPort {
  private authorizations: VisitAuthorization[] = [...MOCK_AUTHORIZATIONS]

  async findAll(filters: AuthorizationFilters): Promise<VisitAuthorization[]> {
    await simulateDelay()
    return this.authorizations.filter(a => {
      if (filters.propertyId && a.propertyId !== filters.propertyId) return false
      if (filters.status && a.status !== filters.status) return false
      if (filters.residentId && a.residentId !== filters.residentId) return false
      if (filters.visitorId && a.visitorId !== filters.visitorId) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (
          !a.code.value.toLowerCase().includes(q) &&
          !a.visitorName.toLowerCase().includes(q) &&
          !a.residentName.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }

  async findById(id: string): Promise<VisitAuthorization | null> {
    await simulateDelay()
    return this.authorizations.find(a => a.id === id) ?? null
  }

  async findByCode(code: string): Promise<VisitAuthorization | null> {
    await simulateDelay()
    return this.authorizations.find(a => a.code.value === code.toUpperCase()) ?? null
  }

  async findByResident(residentId: string): Promise<VisitAuthorization[]> {
    await simulateDelay()
    return this.authorizations.filter(a => a.residentId === residentId)
  }

  async create(data: CreateAuthorizationDto): Promise<VisitAuthorization> {
    await simulateDelay()
    const resident = MOCK_RESIDENTS.find(r => r.id === data.residentId)
    const unit = MOCK_UNITS.find(u => u.id === data.unitId)

    let visitorName = ''
    let visitorDocument = ''
    let visitorId: string | null = null

    if (data.visitorSource === 'EXISTING' && data.visitorId) {
      const visitor = MOCK_VISITORS.find(v => v.id === data.visitorId)
      visitorName = visitor?.name.full ?? ''
      visitorDocument = visitor?.document.format() ?? ''
      visitorId = data.visitorId
    } else {
      visitorName = data.quickVisitorName ?? ''
      visitorDocument = ''
      visitorId = null
    }

    const validityPeriod =
      data.startDate && data.endDate ? DateRange.create(data.startDate, data.endDate) : null

    const authorization: VisitAuthorization = {
      id: generateId('auth'),
      code: AuthorizationCode.generate(),
      type: data.type,
      status: 'ACTIVE',
      validityPeriod,
      entryDate: data.entryDate ?? null,
      entryTime: data.entryTime ?? null,
      allowedDays: data.allowedDays ?? [],
      allowedTimeStart: data.allowedTimeStart ?? null,
      allowedTimeEnd: data.allowedTimeEnd ?? null,
      visitorSource: data.visitorSource,
      residentId: data.residentId,
      residentName: resident?.name.full ?? '',
      visitorId,
      visitorName,
      visitorDocument,
      unitId: data.unitId,
      unitNumber: unit?.number ?? '',
      propertyId: data.propertyId,
      observations: data.observations ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.authorizations.push(authorization)
    return authorization
  }

  async cancel(id: string): Promise<VisitAuthorization> {
    await simulateDelay()
    const idx = this.authorizations.findIndex(a => a.id === id)
    if (idx === -1) throw new Error(`Autorización ${id} no encontrada`)
    this.authorizations[idx] = { ...this.authorizations[idx], status: 'CANCELLED', updatedAt: new Date() }
    return this.authorizations[idx]
  }

  async markAsUsed(id: string): Promise<VisitAuthorization> {
    await simulateDelay()
    const idx = this.authorizations.findIndex(a => a.id === id)
    if (idx === -1) throw new Error(`Autorización ${id} no encontrada`)
    this.authorizations[idx] = { ...this.authorizations[idx], status: 'USED', updatedAt: new Date() }
    return this.authorizations[idx]
  }
}
