import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AccessLogFilters, RegisterEntryDto, RegisterExitDto } from '@/core/domain/models/access-log.model'
import { GetPeopleInsideUseCase } from '@/core/application/use-cases/access-logs/get-people-inside.use-case'
import { RegisterEntryUseCase } from '@/core/application/use-cases/access-logs/register-entry.use-case'
import { RegisterExitUseCase } from '@/core/application/use-cases/access-logs/register-exit.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getPeopleInside = new GetPeopleInsideUseCase(container.accessLogRepository)
const registerEntry = new RegisterEntryUseCase(
  container.accessLogRepository,
  container.authorizationRepository
)
const registerExit = new RegisterExitUseCase(container.accessLogRepository)

export function useAccessLogs(filters: AccessLogFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.accessLogs(filters),
    queryFn: () => container.accessLogRepository.findAll(filters),
  })
}

export function usePeopleInside(propertyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.peopleInside(propertyId),
    queryFn: () => getPeopleInside.execute(propertyId),
    refetchInterval: 30_000,
    enabled: !!propertyId,
  })
}

export function useRegisterEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegisterEntryDto) => registerEntry.execute(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['access-logs'] })
      qc.invalidateQueries({ queryKey: ['authorizations'] })
    },
  })
}

export function useRegisterExit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegisterExitDto) => registerExit.execute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['access-logs'] }),
  })
}

