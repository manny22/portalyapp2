import type { Visitor, VisitorFilters, CreateVisitorDto, UpdateVisitorDto } from '../models/visitor.model'

export interface VisitorRepositoryPort {
  findAll(filters: VisitorFilters): Promise<Visitor[]>
  findById(id: string): Promise<Visitor | null>
  findByDocument(documentNumber: string): Promise<Visitor | null>
  create(data: CreateVisitorDto): Promise<Visitor>
  update(id: string, data: UpdateVisitorDto): Promise<Visitor>
}
