import type { User } from '@/core/domain/models/user.model'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { Email } from '@/core/domain/value-objects/email.vo'

export interface UserWithPassword extends User {
  passwordHash: string
}

export const MOCK_USERS: UserWithPassword[] = [
  {
    id: 'user-1',
    name: FullName.create('Super', 'Admin'),
    email: Email.create('superadmin@janora.com'),
    role: 'SUPER_ADMIN',
    propertyId: null,
    residentId: null,
    isActive: true,
    passwordHash: 'admin123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    name: FullName.create('Sofia', 'Peña'),
    email: Email.create('admin@janora.com'),
    role: 'PROPERTY_ADMIN',
    propertyId: 'prop-1',
    residentId: null,
    isActive: true,
    passwordHash: 'admin123',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'user-3',
    name: FullName.create('Juan', 'Pérez'),
    email: Email.create('guardia@janora.com'),
    role: 'SECURITY_GUARD',
    propertyId: 'prop-1',
    residentId: null,
    isActive: true,
    passwordHash: 'guardia123',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'user-4',
    name: FullName.create('Carlos', 'Ramírez'),
    email: Email.create('carlos.ramirez@email.com'),
    role: 'RESIDENT',
    propertyId: 'prop-1',
    residentId: 'res-1',
    isActive: true,
    passwordHash: 'residente123',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
]
