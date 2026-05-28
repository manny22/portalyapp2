import { useState } from 'react'
import { useAuthorizations, useCreateAuthorization, useCancelAuthorization } from '@/shared/hooks/features/useAuthorizations'
import type { VisitAuthorization, CreateAuthorizationDto } from '@/core/domain/models/visit-authorization.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'
import { AuthorizationFormModal } from './AuthorizationFormModal'
import { useToast } from '@/shared/hooks/useToast'

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  ACTIVE: 'success', PENDING: 'warning', USED: 'info', EXPIRED: 'danger', CANCELLED: 'neutral',
}
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Activa', PENDING: 'Pendiente', USED: 'Usada', EXPIRED: 'Expirada', CANCELLED: 'Cancelada',
}
const TYPE_LABEL: Record<string, string> = {
  ONE_TIME: 'Una vez', RECURRING: 'Temporal', PERMANENT: 'Permanente',
}
const DAY_LABEL: Record<string, string> = {
  MON: 'L', TUE: 'M', WED: 'X', THU: 'J', FRI: 'V', SAT: 'S', SUN: 'D',
}

function formatValidity(a: VisitAuthorization): string {
  if (a.type === 'ONE_TIME') {
    return `${a.entryDate ?? '—'} ${a.entryTime ?? ''}`
  }
  if (a.type === 'RECURRING') {
    const days = a.allowedDays.map(d => DAY_LABEL[d]).join(' ')
    const range = a.validityPeriod
      ? `${a.validityPeriod.startDate.toLocaleDateString('es-CO')} – ${a.validityPeriod.endDate.toLocaleDateString('es-CO')}`
      : '—'
    const hours = a.allowedTimeStart ? `${a.allowedTimeStart}–${a.allowedTimeEnd}` : ''
    return [range, days, hours].filter(Boolean).join(' · ')
  }
  return 'Sin restricción'
}

function AuthorizationsColumns(onCancel: (id: string) => void): Column<VisitAuthorization>[] {
  return [
    {
      key: 'code',
      header: 'Código',
      render: a => (
        <div>
          <span className="font-mono font-bold text-slate-800">{a.code.value}</span>
          <p className="text-xs text-slate-500 mt-0.5">{TYPE_LABEL[a.type]}</p>
        </div>
      ),
    },
    {
      key: 'visitor',
      header: 'Visitante',
      render: a => (
        <div>
          <p className="font-medium text-slate-800">{a.visitorName}</p>
          {a.visitorDocument
            ? <p className="text-xs text-slate-500">{a.visitorDocument}</p>
            : <span className="text-xs text-amber-600 font-medium">Ingreso rápido</span>
          }
        </div>
      ),
    },
    {
      key: 'resident',
      header: 'Residente',
      render: a => (
        <div>
          <p className="text-sm text-slate-800">{a.residentName}</p>
          <p className="text-xs text-slate-500">Apt. {a.unitNumber}</p>
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validez',
      render: a => <span className="text-xs text-slate-600">{formatValidity(a)}</span>,
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
              Cancelar
            </Button>
          )}
        </div>
      ),
    },
  ]
}

export function AuthorizationsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading, error, refetch } = useAuthorizations()
  const createAuthorization = useCreateAuthorization()
  const cancelAuthorization = useCancelAuthorization()
  const toast = useToast()

  const filtered = (data ?? []).filter(a =>
    a.visitorName.toLowerCase().includes(search.toLowerCase()) ||
    a.residentName.toLowerCase().includes(search.toLowerCase()) ||
    a.code.value.includes(search.toUpperCase())
  )

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
      toast.success('Autorización cancelada')
    } catch {
      toast.error('Error al cancelar la autorización')
    }
  }

  const columns = AuthorizationsColumns(handleCancel)

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
            placeholder="Buscar por visitante, residente o código..."
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
      />
    </AppLayout>
  )
}
