import type { VisitorRepositoryPort } from '@/core/domain/ports/visitor.repository.port'
import type { Visitor, VisitorFilters, CreateVisitorDto, UpdateVisitorDto } from '@/core/domain/models/visitor.model'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { DocumentNumber } from '@/core/domain/value-objects/document-number.vo'
import { PhoneNumber } from '@/core/domain/value-objects/phone-number.vo'
import { MOCK_VISITORS } from '../data/visitors.data'
import { simulateDelay, generateId } from './base-mock.repository'

export class VisitorMockRepository implements VisitorRepositoryPort {
  private visitors: Visitor[] = [...MOCK_VISITORS]

  async findAll(filters: VisitorFilters): Promise<Visitor[]> {
    await simulateDelay()
    return this.visitors.filter(v => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchesName = v.name.full.toLowerCase().includes(q)
        const matchesDoc = v.document.number.includes(q)
        if (!matchesName && !matchesDoc) return false
      }
      if (filters.documentNumber && !v.document.number.includes(filters.documentNumber)) return false
      return true
    })
  }

  async findById(id: string): Promise<Visitor | null> {
    await simulateDelay()
    return this.visitors.find(v => v.id === id) ?? null
  }

  async findByDocument(documentNumber: string): Promise<Visitor | null> {
    await simulateDelay()
    return this.visitors.find(v => v.document.number === documentNumber) ?? null
  }

  async create(data: CreateVisitorDto): Promise<Visitor> {
    await simulateDelay()
    const visitor: Visitor = {
      id: generateId('vis'),
      name: FullName.create(data.firstName, data.lastName),
      document: DocumentNumber.create(data.documentType as never, data.documentNumber),
      phone: PhoneNumber.createOptional(data.phone),
      company: data.company ?? null,
      observations: data.observations ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.visitors.push(visitor)
    return visitor
  }

  async update(id: string, data: UpdateVisitorDto): Promise<Visitor> {
    await simulateDelay()
    const idx = this.visitors.findIndex(v => v.id === id)
    if (idx === -1) throw new Error(`Visitante ${id} no encontrado`)
    const current = this.visitors[idx]
    const updated: Visitor = {
      ...current,
      phone: data.phone !== undefined ? PhoneNumber.createOptional(data.phone) : current.phone,
      company: data.company !== undefined ? (data.company ?? null) : current.company,
      observations: data.observations !== undefined ? (data.observations ?? null) : current.observations,
      updatedAt: new Date(),
    }
    this.visitors[idx] = updated
    return updated
  }
}
