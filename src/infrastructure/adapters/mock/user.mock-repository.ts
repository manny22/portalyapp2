import type { UserRepositoryPort } from '@/core/domain/ports/user.repository.port'
import type { User, UserFilters, CreateUserDto, UpdateUserDto } from '@/core/domain/models/user.model'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { Email } from '@/core/domain/value-objects/email.vo'
import { MOCK_USERS } from '../data/users.data'
import { simulateDelay, generateId } from './base-mock.repository'

export class UserMockRepository implements UserRepositoryPort {
  private users: User[] = MOCK_USERS.map(({ passwordHash: _p, ...u }) => u)

  async findAll(filters: UserFilters): Promise<User[]> {
    await simulateDelay()
    return this.users.filter(u => {
      if (filters.propertyId && u.propertyId !== filters.propertyId) return false
      if (filters.role && u.role !== filters.role) return false
      if (filters.isActive !== undefined && u.isActive !== filters.isActive) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!u.name.full.toLowerCase().includes(q) && !u.email.value.includes(q)) return false
      }
      return true
    })
  }

  async findById(id: string): Promise<User | null> {
    await simulateDelay()
    return this.users.find(u => u.id === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    await simulateDelay()
    return this.users.find(u => u.email.value === email.toLowerCase()) ?? null
  }

  async create(data: CreateUserDto): Promise<User> {
    await simulateDelay()
    const user: User = {
      id: generateId('user'),
      name: FullName.create(data.firstName, data.lastName),
      email: Email.create(data.email),
      role: data.role,
      propertyId: data.propertyId ?? null,
      residentId: data.residentId ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.users.push(user)
    return user
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    await simulateDelay()
    const idx = this.users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error(`Usuario ${id} no encontrado`)
    const current = this.users[idx]
    const updated: User = {
      ...current,
      name:
        data.firstName || data.lastName
          ? FullName.create(data.firstName ?? current.name.firstName, data.lastName ?? current.name.lastName)
          : current.name,
      role: data.role ?? current.role,
      isActive: data.isActive ?? current.isActive,
      updatedAt: new Date(),
    }
    this.users[idx] = updated
    return updated
  }

  async toggleStatus(id: string): Promise<User> {
    await simulateDelay()
    const idx = this.users.findIndex(u => u.id === id)
    if (idx === -1) throw new Error(`Usuario ${id} no encontrado`)
    this.users[idx] = { ...this.users[idx], isActive: !this.users[idx].isActive, updatedAt: new Date() }
    return this.users[idx]
  }
}
