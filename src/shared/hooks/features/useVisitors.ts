import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { VisitorFilters, CreateVisitorDto, UpdateVisitorDto } from '@/core/domain/models/visitor.model'
import { GetVisitorsUseCase } from '@/core/application/use-cases/visitors/get-visitors.use-case'
import { CreateVisitorUseCase } from '@/core/application/use-cases/visitors/create-visitor.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getVisitors = new GetVisitorsUseCase(container.visitorRepository)
const createVisitor = new CreateVisitorUseCase(container.visitorRepository)

export function useVisitors(filters: VisitorFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.visitors(filters),
    queryFn: () => getVisitors.execute(filters),
  })
}

export function useCreateVisitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVisitorDto) => createVisitor.execute(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  })
}

export function useUpdateVisitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVisitorDto }) =>
      container.visitorRepository.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  })
}
