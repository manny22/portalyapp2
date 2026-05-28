import type { User, UserFilters, CreateUserDto, UpdateUserDto } from '../models/user.model'

export interface UserRepositoryPort {
  findAll(filters: UserFilters): Promise<User[]>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserDto): Promise<User>
  update(id: string, data: UpdateUserDto): Promise<User>
  toggleStatus(id: string): Promise<User>
}
