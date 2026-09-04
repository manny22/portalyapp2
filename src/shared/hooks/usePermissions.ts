import type { UserRole } from '@/core/domain/models/user.model'
import { useAuth } from './useAuth'

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'SECURITY_GUARD', 'RESIDENT'],
  '/residents': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'SECURITY_GUARD'],
  '/pets': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'RESIDENT'],
  '/vehicles': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'RESIDENT'],
  '/visitors': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'SECURITY_GUARD', 'RESIDENT'],
  '/authorizations': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'SECURITY_GUARD', 'RESIDENT'],
  '/access-control': ['SUPER_ADMIN', 'PROPERTY_ADMIN', 'SECURITY_GUARD'],
  '/reports': ['SUPER_ADMIN', 'PROPERTY_ADMIN'],
  '/users': ['SUPER_ADMIN', 'PROPERTY_ADMIN'],
  '/settings': ['SUPER_ADMIN', 'PROPERTY_ADMIN'],
}

export function usePermissions() {
  const { user } = useAuth()

  function canAccess(route: string): boolean {
    if (!user) return false
    const allowed = ROUTE_PERMISSIONS[route]
    if (!allowed) return false
    return allowed.includes(user.role)
  }

  function hasRole(...roles: UserRole[]): boolean {
    if (!user) return false
    return roles.includes(user.role)
  }

  return { canAccess, hasRole }
}
