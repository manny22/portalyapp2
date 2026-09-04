import { useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { APP_CONFIG } from '@/shared/config/app.config'
import {
  usePeopleInside,
  useAccessLogs,
  useRegisterEntry,
  useRegisterExit,
} from '@/shared/hooks/features/useAccessLogs'
import { useResidents } from '@/shared/hooks/features/useResidents'
import { useVisitors } from '@/shared/hooks/features/useVisitors'
import type {
  AccessLog,
  RegisterEntryDto,
  RegisterExitDto,
} from '@/core/domain/models/access-log.model'
import type { Resident } from '@/core/domain/models/resident.model'
import type { Visitor } from '@/core/domain/models/visitor.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge } from '@/ui/atoms'
import { RegisterEntryModal } from './RegisterEntryModal'
import { RegisterExitModal } from './RegisterExitModal'
import { useToast } from '@/shared/hooks/useToast'

function formatTime(date?: Date | string) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

function getLogColumns(residents: Resident[], visitors: Visitor[]): Column<AccessLog>[] {
  const residentsMap = new Map(residents.map(r => [r.id, r]))
  const visitorsMap = new Map(visitors.map(v => [v.id, v]))

  const getPersonName = (log: AccessLog): string => {
    if (log.residentId) {
      const resident = residentsMap.get(log.residentId)
      return resident ? `${resident.firstName} ${resident.lastName}`.trim() : log.residentId
    }
    if (log.visitorId) {
      const visitor = visitorsMap.get(log.visitorId)
      return visitor ? `${visitor.firstName} ${visitor.lastName}`.trim() : log.visitorId
    }
    return '—'
  }

  return [
    {
      key: 'type',
      header: 'Tipo',
      render: log => (
        <Badge variant={log.type === 'ENTRY' ? 'success' : 'neutral'}>
          {log.type === 'ENTRY' ? 'Ingreso' : 'Salida'}
        </Badge>
      ),
    },
    {
      key: 'person',
      header: 'Persona',
      render: log => <span className="text-slate-600 text-sm">{getPersonName(log)}</span>,
    },
    {
      key: 'time',
      header: 'Hora',
      render: log => <span className="text-sm tabular-nums">{formatTime(log.createdAt)}</span>,
    },
    {
      key: 'notes',
      header: 'Notas',
      render: log =>
        log.notes ? (
          <span className="text-sm text-slate-600">{log.notes}</span>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ]
}

export function AccessControlPage() {
  const { user } = useAuth()
  const propertyId = user?.propertyId ?? APP_CONFIG.DEFAULT_PROPERTY_ID

  const [entryOpen, setEntryOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [exitSearch, setExitSearch] = useState('')

  const toast = useToast()
  const { data: inside = [], isLoading: loadingInside } = usePeopleInside(propertyId)
  const {
    data: logs = [],
    isLoading: loadingLogs,
    error,
    refetch: refetchLogs,
  } = useAccessLogs({ propertyId })

  const registerEntry = useRegisterEntry()
  const registerExit = useRegisterExit()

  const { data: residents = [] } = useResidents()
  const { data: visitors = [] } = useVisitors()

  const insideCount = inside.filter(l => l.type === 'ENTRY').length
  const residentCount = inside.filter(l => l.type === 'ENTRY' && l.residentId).length
  const visitorCount = inside.filter(l => l.type === 'ENTRY' && l.visitorId).length

  async function handleEntry(data: RegisterEntryDto) {
    try {
      await registerEntry.mutateAsync(data)
      toast.success('Ingreso registrado')
      setEntryOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar ingreso'

      // Mapear mensajes de error a mensajes amigables
      const errorMessages: Record<string, string> = {
        'Autorización no encontrada': 'La autorización no existe o fue eliminada.',
        'La autorización no está vigente': 'La autorización ha expirado o aún no es válida.',
        'Autorización no válida': 'Esta persona no tiene autorización para ingresar.',
      }

      const friendlyMessage = errorMessages[message] || message
      toast.error(friendlyMessage)
    }
  }

  async function handleExit(data: RegisterExitDto) {
    try {
      await registerExit.mutateAsync(data)
      toast.success('Salida registrada')
      setExitOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar salida'

      // Mapear mensajes de error a mensajes amigables
      const errorMessages: Record<string, string> = {
        'La persona ya tiene una salida registrada después de su última entrada':
          'Esta persona ya salió. Verifique que no haya sido registrada dos veces.',
        'No hay entrada registrada para esta salida':
          'No hay entrada registrada. Registre primero el ingreso.',
        'Se requiere residentId o visitorId para registrar una salida':
          'Error: no se pudo identificar a la persona.',
      }

      const friendlyMessage = errorMessages[message] || message
      toast.error(friendlyMessage)
    }
  }

  return (
    <AppLayout>
      <PageLayout title="Control de Acceso" description="Registro de ingresos y salidas">
        {/* Summary counters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: 'Dentro ahora',
              value: insideCount,
              color: 'text-green-700',
              bg: 'bg-green-50 border-green-200',
            },
            {
              label: 'Residentes',
              value: residentCount,
              color: 'text-blue-700',
              bg: 'bg-blue-50 border-blue-200',
            },
            {
              label: 'Visitantes',
              value: visitorCount,
              color: 'text-amber-700',
              bg: 'bg-amber-50 border-amber-200',
            },
          ].map(stat => (
            <div
              key={stat.label}
              className={`rounded-xl border-2 ${stat.bg} px-4 py-3 text-center`}
            >
              {loadingInside ? (
                <div className="h-8 w-12 mx-auto rounded bg-slate-200 animate-pulse mb-1" />
              ) : (
                <p className={`text-3xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              )}
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons — designed for guard tablet, large touch targets */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setEntryOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-5 text-white shadow-lg shadow-green-200 hover:bg-green-700 active:scale-[0.98] transition-all"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-bold">Registrar Ingreso</span>
          </button>

          <button
            onClick={() => {
              setExitSearch('')
              setExitOpen(true)
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-5 text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Registrar Salida</span>
              {insideCount > 0 && (
                <span className="rounded-full bg-white/30 px-2 py-0.5 text-sm font-bold">
                  {insideCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Today's log */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Movimientos de hoy
          </h3>
          <DataTable
            columns={getLogColumns(residents, visitors)}
            data={logs}
            keyExtractor={l => l.id}
            isLoading={loadingLogs}
            error={error}
            onRetry={refetchLogs}
            emptyTitle="Sin registros"
            emptyDescription="No hay movimientos registrados hoy."
          />
        </div>
      </PageLayout>

      <RegisterEntryModal
        key={entryOpen ? 'open' : 'closed'}
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        onSubmit={handleEntry}
        loading={registerEntry.isPending}
        propertyId={propertyId}
        inside={inside}
      />

      <RegisterExitModal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        inside={inside}
        onExit={handleExit}
        loadingId={registerExit.isPending ? 'pending' : null}
        search={exitSearch}
        onSearchChange={setExitSearch}
        residents={residents}
        visitors={visitors}
      />
    </AppLayout>
  )
}
