import type { UserRepositoryPort } from '@/core/domain/ports/user.repository.port'
import type { User, CreateUserDto } from '@/core/domain/models/user.model'

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(data: CreateUserDto): Promise<User> {
    const exists = await this.userRepository.findByEmail(data.email)
    if (exists) throw new Error(`El email ${data.email} ya está registrado`)
    return this.userRepository.create(data)
  }
}
