import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { EmptyState } from '@/ui/molecules'

export function ReportsPage() {
  return (
    <AppLayout>
      <PageLayout title="Reportes" description="Análisis y estadísticas del conjunto">
        <EmptyState
          title="Reportes en construcción"
          description="Próximamente podrás generar reportes de accesos, residentes y visitantes."
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </PageLayout>
    </AppLayout>
  )
}
