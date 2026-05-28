import { createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router'
import { LoginPage } from '@/ui/pages/LoginPage/LoginPage'
import { DashboardPage } from '@/ui/pages/DashboardPage/DashboardPage'
import { ResidentsPage } from '@/ui/pages/ResidentsPage/ResidentsPage'
import { VisitorsPage } from '@/ui/pages/VisitorsPage/VisitorsPage'
import { VehiclesPage } from '@/ui/pages/VehiclesPage/VehiclesPage'
import { PetsPage } from '@/ui/pages/PetsPage/PetsPage'
import { AuthorizationsPage } from '@/ui/pages/AuthorizationsPage/AuthorizationsPage'
import { AccessControlPage } from '@/ui/pages/AccessControlPage/AccessControlPage'
import { ReportsPage } from '@/ui/pages/ReportsPage/ReportsPage'
import { UsersPage } from '@/ui/pages/UsersPage/UsersPage'
import { SettingsPage } from '@/ui/pages/SettingsPage/SettingsPage'
import { container } from '@/infrastructure/di/container'

function getSession() {
  return container.authRepository.getSession()
}

const rootRoute = createRootRoute({ component: Outlet })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const session = getSession()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw redirect({ to: session ? '/dashboard' : '/login' } as any)
  },
  component: () => null,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    const session = getSession()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (session) throw redirect({ to: '/dashboard' } as any)
  },
  component: LoginPage,
})

function makeRoute(path: string, Component: () => React.JSX.Element) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    beforeLoad: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!getSession()) throw redirect({ to: '/login' } as any)
    },
    component: Component,
  })
}

const dashboardRoute = makeRoute('/dashboard', DashboardPage)
const residentsRoute = makeRoute('/residents', ResidentsPage)
const visitorsRoute = makeRoute('/visitors', VisitorsPage)
const vehiclesRoute = makeRoute('/vehicles', VehiclesPage)
const petsRoute = makeRoute('/pets', PetsPage)
const authorizationsRoute = makeRoute('/authorizations', AuthorizationsPage)
const accessControlRoute = makeRoute('/access-control', AccessControlPage)
const reportsRoute = makeRoute('/reports', ReportsPage)
const usersRoute = makeRoute('/users', UsersPage)
const settingsRoute = makeRoute('/settings', SettingsPage)

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  residentsRoute,
  visitorsRoute,
  vehiclesRoute,
  petsRoute,
  authorizationsRoute,
  accessControlRoute,
  reportsRoute,
  usersRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
