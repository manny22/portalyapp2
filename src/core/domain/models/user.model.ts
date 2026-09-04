export type UserRole = 'SUPER_ADMIN' | 'PROPERTY_ADMIN' | 'SECURITY_GUARD' | 'RESIDENT'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  propertyId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserFilters {
  propertyId?: string
}

export interface CreateUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: UserRole
  propertyId?: string
}

export interface UpdateUserDto {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: UserRole
  propertyId?: string
}
