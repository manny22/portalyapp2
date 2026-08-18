import type { UserRepositoryPort } from '@/core/domain/ports/user.repository.port'
import type { User, UserFilters, CreateUserDto, UpdateUserDto } from '@/core/domain/models/user.model'
import { httpClient } from './base-http-client'

export class UserHttpRepository implements UserRepositoryPort {
  async findAll(filters: UserFilters): Promise<User[]> {
    const params: Record<string, string | number | boolean> = {}
    if (filters.propertyId) params.propertyId = filters.propertyId

    return httpClient.get<User[]>('/users', { params })
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await httpClient.get<User>(`/users/${id}`)
    } catch {
      return null
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await httpClient.get<User>(`/users/email/${email}`)
    } catch {
      return null
    }
  }

  async create(data: CreateUserDto): Promise<User> {
    return httpClient.post<User>('/users', data)
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    return httpClient.patch<User>(`/users/${id}`, data)
  }

  async toggleStatus(id: string): Promise<User> {
    return httpClient.patch<User>(`/users/${id}/toggle-status`, {})
  }
}
