import type {
  VisitAuthorization,
  AuthorizationFilters,
  CreateAuthorizationDto,
} from '../models/visit-authorization.model'

export interface AuthorizationRepositoryPort {
  findAll(filters: AuthorizationFilters): Promise<VisitAuthorization[]>
  findById(id: string): Promise<VisitAuthorization | null>
  findByResident(residentId: string): Promise<VisitAuthorization[]>
  create(data: CreateAuthorizationDto): Promise<VisitAuthorization>
  revoke(id: string): Promise<VisitAuthorization>
}
