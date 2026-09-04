import { useState, useMemo } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { APP_CONFIG } from '@/shared/config/app.config'
import {
  useAuthorizations,
  useCreateAuthorization,
  useCancelAuthorization,
} from '@/shared/hooks/features/useAuthorizations'
import { useResidents } from '@/shared/hooks/features/useResidents'
import { useVisitors } from '@/shared/hooks/features/useVisitors'
import { useResidentialUnits } from '@/shared/hooks/features/useResidentialUnits'
import type {
  VisitAuthorization,
  CreateAuthorizationDto,
} from '@/core/domain/models/visit-authorization.model'
import type { Resident } from '@/core/domain/models/resident.model'
import type { Visitor } from '@/core/domain/models/visitor.model'
import type { ResidentialUnit } from '@/core/domain/models/residential-unit.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'
import { AuthorizationFormModal } from './AuthorizationFormModal'
import { useToast } from '@/shared/hooks/useToast'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  ACTIVE: 'success',
  PENDING: 'warning',
  EXPIRED: 'danger',
  REVOKED: 'neutral',
}
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendiente',
  EXPIRED: 'Expirada',
  REVOKED: 'Revocada',
}

const getFullName = (firstName: string, lastName: string) => `${firstName} ${lastName}`.trim()

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

function AuthorizationsColumns(
  residentsMap: Map<string, Resident>,
  visitorsMap: Map<string, Visitor>,
  unitsMap: Map<string, ResidentialUnit>,
  onCancel: (id: string) => void
): Column<VisitAuthorization>[] {
  return [
    {
      key: 'visitor',
      header: 'Visitante',
      render: a => {
        const visitor = visitorsMap.get(a.visitorId)
        return (
          <div>
            <p className="font-medium text-slate-800">
              {visitor ? getFullName(visitor.firstName, visitor.lastName) : a.visitorId}
            </p>
            {visitor && (
              <p className="text-xs text-slate-500">
                {visitor.documentType} {visitor.documentNumber}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: 'resident',
      header: 'Residente',
      render: a => {
        const resident = residentsMap.get(a.residentId)
        const unit = unitsMap.get(a.unitId)
        return (
          <div>
            <p className="text-sm text-slate-800">
              {resident ? getFullName(resident.firstName, resident.lastName) : a.residentId}
            </p>
            <p className="text-xs text-slate-500">Apt. {unit?.number ?? a.unitId}</p>
          </div>
        )
      },
    },
    {
      key: 'validity',
      header: 'Validez',
      render: a => (
        <span className="text-xs text-slate-600">
          {formatDateTime(a.validFrom)} – {formatDateTime(a.validUntil)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: a => (
        <Badge variant={STATUS_VARIANT[a.status]} dot>
          {STATUS_LABEL[a.status]}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: a => (
        <div className="flex justify-end">
          {(a.status === 'ACTIVE' || a.status === 'PENDING') && (
            <Button size="sm" variant="danger" onClick={() => onCancel(a.id)}>
              Revocar
            </Button>
          )}
        </div>
      ),
    },
  ]
}

export function AuthorizationsPage() {
  const { user } = useAuth()
  const propertyId = user?.propertyId ?? APP_CONFIG.DEFAULT_PROPERTY_ID
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error, refetch } = useAuthorizations({ propertyId })
  const { data: residents = [] } = useResidents()
  const { data: visitors = [] } = useVisitors()
  const { units = [] } = useResidentialUnits(propertyId)
  const createAuthorization = useCreateAuthorization()
  const cancelAuthorization = useCancelAuthorization()
  const toast = useToast()

  const residentsMap = useMemo(() => new Map(residents.map(r => [r.id, r])), [residents])
  const visitorsMap = useMemo(() => new Map(visitors.map(v => [v.id, v])), [visitors])
  const unitsMap = useMemo(() => new Map(units.map(u => [u.id, u])), [units])

  const filtered = (data ?? []).filter(a => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const visitorName = visitorsMap.get(a.visitorId)
      ? getFullName(visitorsMap.get(a.visitorId)!.firstName, visitorsMap.get(a.visitorId)!.lastName)
      : ''
    const residentName = residentsMap.get(a.residentId)
      ? getFullName(
          residentsMap.get(a.residentId)!.firstName,
          residentsMap.get(a.residentId)!.lastName
        )
      : ''
    return visitorName.toLowerCase().includes(q) || residentName.toLowerCase().includes(q)
  })

  async function handleSubmit(payload: CreateAuthorizationDto) {
    try {
      await createAuthorization.mutateAsync(payload)
      toast.success('Autorización creada correctamente')
      setModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la autorización')
    }
  }

  async function handleCancel(id: string) {
    try {
      await cancelAuthorization.mutateAsync(id)
      toast.success('Autorización revocada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al revocar la autorización')
    }
  }

  const columns = AuthorizationsColumns(residentsMap, visitorsMap, unitsMap, handleCancel)

  return (
    <AppLayout>
      <PageLayout
        title="Autorizaciones"
        description="Gestión de autorizaciones de ingreso"
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Nueva autorización
          </Button>
        }
        filters={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por visitante o residente..."
            className="w-full sm:w-80"
          />
        }
      >
        <DataTable
          columns={columns}
          data={filtered}
          keyExtractor={a => a.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="Sin autorizaciones"
          emptyDescription="No hay autorizaciones registradas."
        />
      </PageLayout>

      <AuthorizationFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={createAuthorization.isPending}
        propertyId={propertyId}
      />
    </AppLayout>
  )
}
