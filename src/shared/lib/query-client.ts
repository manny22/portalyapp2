import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const QUERY_KEYS = {
  residents: (filters?: object) => ['residents', filters] as const,
  resident: (id: string) => ['residents', id] as const,
  pets: (filters?: object) => ['pets', filters] as const,
  vehicles: (filters?: object) => ['vehicles', filters] as const,
  visitors: (filters?: object) => ['visitors', filters] as const,
  authorizations: (filters?: object) => ['authorizations', filters] as const,
  accessLogs: (filters?: object) => ['access-logs', filters] as const,
  peopleInside: (propertyId: string) => ['access-logs', 'inside', propertyId] as const,
  dashboardMetrics: (propertyId: string) => ['dashboard', 'metrics', propertyId] as const,
  users: (filters?: object) => ['users', filters] as const,
  accessReport: (filters?: object) => ['reports', 'access', filters] as const,
} as const
