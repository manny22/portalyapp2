import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UserFilters, CreateUserDto, UpdateUserDto } from '@/core/domain/models/user.model'
import { GetUsersUseCase } from '@/core/application/use-cases/users/get-users.use-case'
import { CreateUserUseCase } from '@/core/application/use-cases/users/create-user.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getUsers = new GetUsersUseCase(container.userRepository)
const createUser = new CreateUserUseCase(container.userRepository)

export function useUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.users(filters),
    queryFn: () => getUsers.execute(filters),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserDto) => createUser.execute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => container.userRepository.toggleStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      container.userRepository.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

