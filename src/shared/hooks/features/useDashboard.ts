import { useQuery } from '@tanstack/react-query'
import { GetDashboardMetricsUseCase } from '@/core/application/use-cases/reports/get-dashboard-metrics.use-case'
import { container } from '@/infrastructure/di/container'
import { QUERY_KEYS } from '@/shared/lib/query-client'

const getDashboardMetrics = new GetDashboardMetricsUseCase(container.reportsRepository)

export function useDashboardMetrics(propertyId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardMetrics(propertyId),
    queryFn: () => getDashboardMetrics.execute(propertyId),
    enabled: !!propertyId,
    refetchInterval: 60_000,
  })
}

