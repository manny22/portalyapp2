import type { UserRole } from '@/core/domain/models/user.model'

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PROPERTY_ADMIN: 'PROPERTY_ADMIN',
  SECURITY_GUARD: 'SECURITY_GUARD',
  RESIDENT: 'RESIDENT',
} as const satisfies Record<UserRole, UserRole>

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Administrador',
  PROPERTY_ADMIN: 'Administrador',
  SECURITY_GUARD: 'Vigilante',
  RESIDENT: 'Residente',
}
