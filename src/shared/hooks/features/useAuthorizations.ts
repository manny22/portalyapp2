import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AuthorizationFilters, CreateAuthorizationDto } from '@/core/domain/models/visit-authorization.model'
import { GetAuthorizationsUseCase } from '@/core/application/use-cases/authorizations/get-authorizations.use-case'
import { CreateAuthorizationUseCase } from '@/core/application/use-cases/authorizations/create-authorization.use-case'
import { CancelAuthorizationUseCase } from '@/core/application/use-cases/authorizations/cancel-authorization.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getAuthorizations = new GetAuthorizationsUseCase(container.authorizationRepository)
const createAuthorization = new CreateAuthorizationUseCase(container.authorizationRepository)
const cancelAuthorization = new CancelAuthorizationUseCase(container.authorizationRepository)

export function useAuthorizations(filters: AuthorizationFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.authorizations(filters),
    queryFn: () => getAuthorizations.execute(filters),
  })
}

export function useCreateAuthorization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAuthorizationDto) => createAuthorization.execute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authorizations'] }),
  })
}

export function useCancelAuthorization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelAuthorization.execute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authorizations'] }),
  })
}

