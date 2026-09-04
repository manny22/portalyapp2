import type {
  AccessLog,
  AccessLogFilters,
  RegisterEntryDto,
  RegisterExitDto,
} from '../models/access-log.model'

export interface AccessLogRepositoryPort {
  findAll(filters: AccessLogFilters): Promise<AccessLog[]>
  findById(id: string): Promise<AccessLog | null>
  findPeopleInside(propertyId: string): Promise<AccessLog[]>
  findActiveEntryByPerson(visitorId: string, propertyId: string): Promise<AccessLog | null>
  findActiveEntryByResident(residentId: string, propertyId: string): Promise<AccessLog | null>
  registerEntry(data: RegisterEntryDto): Promise<AccessLog>
  registerExit(data: RegisterExitDto): Promise<AccessLog>
}
