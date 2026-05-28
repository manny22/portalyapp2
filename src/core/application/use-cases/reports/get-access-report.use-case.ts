import type { ReportsRepositoryPort, ReportFilters } from '@/core/domain/ports/reports.repository.port'
import type { AccessLog } from '@/core/domain/models/access-log.model'

export class GetAccessReportUseCase {
  constructor(private readonly reportsRepository: ReportsRepositoryPort) {}

  async execute(filters: ReportFilters): Promise<AccessLog[]> {
    if (filters.dateTo < filters.dateFrom) {
      throw new Error('La fecha final debe ser posterior a la fecha inicial')
    }
    return this.reportsRepository.getAccessLogs(filters)
  }
}
