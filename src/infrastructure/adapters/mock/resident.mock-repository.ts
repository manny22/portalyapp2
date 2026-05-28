import type { ResidentRepositoryPort } from '@/core/domain/ports/resident.repository.port'
import type { Resident, ResidentFilters, CreateResidentDto, UpdateResidentDto } from '@/core/domain/models/resident.model'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { DocumentNumber } from '@/core/domain/value-objects/document-number.vo'
import { Email } from '@/core/domain/value-objects/email.vo'
import { PhoneNumber } from '@/core/domain/value-objects/phone-number.vo'
import { MOCK_RESIDENTS } from '../data/residents.data'
import { MOCK_UNITS } from '../data/properties.data'
import { simulateDelay, generateId } from './base-mock.repository'

export class ResidentMockRepository implements ResidentRepositoryPort {
  private residents: Resident[] = [...MOCK_RESIDENTS]

  async findAll(filters: ResidentFilters): Promise<Resident[]> {
    await simulateDelay()
    return this.residents.filter(r => {
      if (filters.propertyId && r.propertyId !== filters.propertyId) return false
      if (filters.unitId && r.unitId !== filters.unitId) return false
      if (filters.isActive !== undefined && r.isActive !== filters.isActive) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchesName = r.name.full.toLowerCase().includes(q)
        const matchesDoc = r.document.number.includes(q)
        if (!matchesName && !matchesDoc) return false
      }
      return true
    })
  }

  async findById(id: string): Promise<Resident | null> {
    await simulateDelay()
    return this.residents.find(r => r.id === id) ?? null
  }

  async findByUnit(unitId: string): Promise<Resident[]> {
    await simulateDelay()
    return this.residents.filter(r => r.unitId === unitId)
  }

  async create(data: CreateResidentDto): Promise<Resident> {
    await simulateDelay()
    const unit = MOCK_UNITS.find(u => u.id === data.unitId)
    const resident: Resident = {
      id: generateId('res'),
      name: FullName.create(data.firstName, data.lastName),
      document: DocumentNumber.create(data.documentType as never, data.documentNumber),
      email: data.email ? Email.create(data.email) : null,
      phone: PhoneNumber.createOptional(data.phone),
      relation: data.relation,
      observations: data.observations ?? null,
      unitId: data.unitId,
      unitNumber: unit?.number ?? '',
      blockName: unit?.blockName ?? null,
      propertyId: data.propertyId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.residents.push(resident)
    return resident
  }

  async update(id: string, data: UpdateResidentDto): Promise<Resident> {
    await simulateDelay()
    const idx = this.residents.findIndex(r => r.id === id)
    if (idx === -1) throw new Error(`Residente ${id} no encontrado`)

    const current = this.residents[idx]
    const unit = data.unitId ? MOCK_UNITS.find(u => u.id === data.unitId) : null

    const updated: Resident = {
      ...current,
      name: data.firstName && data.lastName
        ? FullName.create(data.firstName, data.lastName)
        : data.firstName
          ? FullName.create(data.firstName, current.name.lastName)
          : current.name,
      email: data.email !== undefined ? (data.email ? Email.create(data.email) : null) : current.email,
      phone: data.phone !== undefined ? PhoneNumber.createOptional(data.phone) : current.phone,
      relation: data.relation ?? current.relation,
      observations: data.observations !== undefined ? (data.observations ?? null) : current.observations,
      unitId: data.unitId ?? current.unitId,
      unitNumber: unit?.number ?? current.unitNumber,
      blockName: unit?.blockName ?? current.blockName,
      updatedAt: new Date(),
    }
    this.residents[idx] = updated
    return updated
  }

  async toggleStatus(id: string): Promise<Resident> {
    await simulateDelay()
    const idx = this.residents.findIndex(r => r.id === id)
    if (idx === -1) throw new Error(`Residente ${id} no encontrado`)
    this.residents[idx] = { ...this.residents[idx], isActive: !this.residents[idx].isActive, updatedAt: new Date() }
    return this.residents[idx]
  }

  async existsByDocument(documentNumber: string, propertyId: string, excludeId?: string): Promise<boolean> {
    await simulateDelay()
    return this.residents.some(
      r => r.document.number === documentNumber &&
        r.propertyId === propertyId &&
        r.id !== excludeId
    )
  }
}
