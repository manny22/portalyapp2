import type {
  VisitAuthorization,
  AuthorizationFilters,
  CreateAuthorizationDto,
} from '../models/visit-authorization.model'

export interface AuthorizationRepositoryPort {
  findAll(filters: AuthorizationFilters): Promise<VisitAuthorization[]>
  findById(id: string): Promise<VisitAuthorization | null>
  findByCode(code: string): Promise<VisitAuthorization | null>
  findByResident(residentId: string): Promise<VisitAuthorization[]>
  create(data: CreateAuthorizationDto): Promise<VisitAuthorization>
  cancel(id: string): Promise<VisitAuthorization>
  markAsUsed(id: string): Promise<VisitAuthorization>
}
