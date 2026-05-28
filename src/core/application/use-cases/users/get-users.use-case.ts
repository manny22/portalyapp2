import type { UserRepositoryPort } from '@/core/domain/ports/user.repository.port'
import type { User, UserFilters } from '@/core/domain/models/user.model'

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(filters: UserFilters): Promise<User[]> {
    return this.userRepository.findAll(filters)
  }
}
