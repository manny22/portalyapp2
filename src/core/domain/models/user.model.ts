import type { Email } from '../value-objects/email.vo'
import type { FullName } from '../value-objects/full-name.vo'

export type UserRole = 'SUPER_ADMIN' | 'PROPERTY_ADMIN' | 'SECURITY_GUARD' | 'RESIDENT'

export interface User {
  id: string
  name: FullName
  email: Email
  role: UserRole
  propertyId: string | null
  residentId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserFilters {
  search?: string
  role?: UserRole
  isActive?: boolean
  propertyId?: string
}

export interface CreateUserDto {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
  propertyId?: string
  residentId?: string
}

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  role?: UserRole
  isActive?: boolean
}
