import type { ReportsRepositoryPort, DashboardMetrics } from '@/core/domain/ports/reports.repository.port'

export class GetDashboardMetricsUseCase {
  constructor(private readonly reportsRepository: ReportsRepositoryPort) {}

  async execute(propertyId: string): Promise<DashboardMetrics> {
    return this.reportsRepository.getDashboardMetrics(propertyId)
  }
}
