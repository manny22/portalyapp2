import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ResidentFilters, CreateResidentDto, UpdateResidentDto } from '@/core/domain/models/resident.model'
import { GetResidentsUseCase } from '@/core/application/use-cases/residents/get-residents.use-case'
import { GetResidentUseCase } from '@/core/application/use-cases/residents/get-resident.use-case'
import { CreateResidentUseCase } from '@/core/application/use-cases/residents/create-resident.use-case'
import { UpdateResidentUseCase } from '@/core/application/use-cases/residents/update-resident.use-case'
import { ToggleResidentStatusUseCase } from '@/core/application/use-cases/residents/toggle-resident-status.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getResidents = new GetResidentsUseCase(container.residentRepository)
const getResident = new GetResidentUseCase(container.residentRepository)
const createResident = new CreateResidentUseCase(container.residentRepository)
const updateResident = new UpdateResidentUseCase(container.residentRepository)
const toggleResidentStatus = new ToggleResidentStatusUseCase(container.residentRepository)

export function useResidents(filters: ResidentFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.residents(filters),
    queryFn: () => getResidents.execute(filters),
  })
}

export function useResident(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.resident(id),
    queryFn: () => getResident.execute(id),
    enabled: !!id,
  })
}

export function useCreateResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateResidentDto) => createResident.execute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents'] }),
  })
}

export function useUpdateResident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResidentDto }) =>
      updateResident.execute(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents'] }),
  })
}

export function useToggleResidentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleResidentStatus.execute(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['residents'] }),
  })
}

