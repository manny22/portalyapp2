import { useAuth } from '@/shared/hooks/useAuth'
import { useDashboardMetrics } from '@/shared/hooks/features/useDashboard'
import { StatCard } from '@/ui/molecules'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { ROUTES } from '@/shared/constants/routes'

export function DashboardPage() {
  const { user } = useAuth()
  const propertyId = user?.propertyId ?? 'prop-001'
  const { data: metrics, isLoading } = useDashboardMetrics(propertyId)

  return (
    <AppLayout>
      <PageLayout title="Dashboard" description="Resumen de actividad del conjunto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Residentes activos"
            value={metrics?.activeResidents ?? 0}
            color="brand"
            loading={isLoading}
            to={ROUTES.RESIDENTS}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="Visitantes hoy"
            value={metrics?.visitorsToday ?? 0}
            color="warning"
            loading={isLoading}
            to={ROUTES.VISITORS}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
          <StatCard
            label="Personas dentro"
            value={metrics?.peopleInside ?? 0}
            color="success"
            loading={isLoading}
            to={ROUTES.ACCESS_CONTROL}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />
          <StatCard
            label="Vehículos registrados"
            value={metrics?.registeredVehicles ?? 0}
            color="brand"
            loading={isLoading}
            to={ROUTES.VEHICLES}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l-1 1h14l-2-1z" />
              </svg>
            }
          />
          <StatCard
            label="Mascotas registradas"
            value={metrics?.registeredPets ?? 0}
            color="warning"
            loading={isLoading}
            to={ROUTES.PETS}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatCard
            label="Autorizaciones activas"
            value={metrics?.activeAuthorizations ?? 0}
            color="success"
            loading={isLoading}
            to={ROUTES.AUTHORIZATIONS}
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
        </div>
      </PageLayout>
    </AppLayout>
  )
}
