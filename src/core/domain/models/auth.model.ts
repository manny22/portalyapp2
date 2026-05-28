import type { UserRole } from './user.model'

export interface AuthSession {
  accessToken: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: UserRole
  propertyId: string | null
  propertyName: string | null
  residentId: string | null
}

export interface LoginDto {
  email: string
  password: string
}
