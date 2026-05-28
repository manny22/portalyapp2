import { useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import {
  usePeopleInside,
  useAccessLogs,
  useRegisterEntry,
  useRegisterExit,
} from '@/shared/hooks/features/useAccessLogs'
import type { AccessLog, RegisterEntryDto, RegisterExitDto } from '@/core/domain/models/access-log.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge } from '@/ui/atoms'
import { RegisterEntryModal } from './RegisterEntryModal'
import { RegisterExitModal } from './RegisterExitModal'
import { useToast } from '@/shared/hooks/useToast'

const PERSON_LABELS: Record<string, string> = {
  RESIDENT: 'Residente', VISITOR: 'Visitante', SERVICE_PROVIDER: 'Proveedor',
  DELIVERY: 'Domicilio', STAFF: 'Personal',
}

const PERSON_COLORS: Record<string, string> = {
  RESIDENT: 'bg-blue-50 text-blue-700',
  VISITOR: 'bg-amber-50 text-amber-700',
  DELIVERY: 'bg-orange-50 text-orange-700',
  SERVICE_PROVIDER: 'bg-purple-50 text-purple-700',
  STAFF: 'bg-slate-100 text-slate-700',
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const LOG_COLUMNS: Column<AccessLog>[] = [
  {
    key: 'person',
    header: 'Persona',
    render: log => (
      <div>
        <p className="font-medium text-slate-800">{log.visitorName ?? log.residentName ?? '—'}</p>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PERSON_COLORS[log.personType] ?? ''}`}>
          {PERSON_LABELS[log.personType]}
        </span>
      </div>
    ),
  },
  {
    key: 'unit',
    header: 'Apt.',
    render: log => <span className="text-slate-600">{log.unitNumber ?? '—'}</span>,
  },
  {
    key: 'plate',
    header: 'Placa',
    render: log => log.vehiclePlate
      ? <span className="font-mono text-sm text-slate-600">{log.vehiclePlate}</span>
      : <span className="text-slate-300">—</span>,
  },
  {
    key: 'entry',
    header: 'Ingreso',
    render: log => <span className="text-sm tabular-nums">{formatTime(log.enteredAt)}</span>,
  },
  {
    key: 'exit',
    header: 'Salida',
    render: log => log.exitedAt
      ? <span className="text-sm tabular-nums text-slate-500">{formatTime(log.exitedAt)}</span>
      : <Badge variant="success" dot>Dentro</Badge>,
  },
  {
    key: 'auth',
    header: 'Autorización',
    render: log => log.authorizationCode
      ? <span className="font-mono text-xs text-green-700 bg-green-50 rounded px-1.5 py-0.5">{log.authorizationCode}</span>
      : <span className="text-slate-300 text-xs">—</span>,
  },
]

export function AccessControlPage() {
  const { user } = useAuth()
  const propertyId = user?.propertyId ?? 'prop-1'
  const guardId = user?.id ?? 'user-3'

  const [entryOpen, setEntryOpen] = useState(false)
  const [exitOpen, setExitOpen] = useState(false)
  const [exitSearch, setExitSearch] = useState('')

  const toast = useToast()
  const { data: inside = [], isLoading: loadingInside, refetch: refetchInside } = usePeopleInside(propertyId)
  const { data: logs = [], isLoading: loadingLogs, error, refetch: refetchLogs } = useAccessLogs({ propertyId })

  const registerEntry = useRegisterEntry()
  const registerExit = useRegisterExit()

  const insideCount = inside.length
  const residentCount = inside.filter(l => l.personType === 'RESIDENT').length
  const visitorCount = inside.filter(l => l.personType !== 'RESIDENT').length

  async function handleEntry(data: RegisterEntryDto) {
    await registerEntry.mutateAsync(data)
    toast.success('Ingreso registrado')
    setEntryOpen(false)
    refetchInside()
    refetchLogs()
  }

  async function handleExit(data: RegisterExitDto) {
    await registerExit.mutateAsync(data)
    toast.success('Salida registrada')
    refetchInside()
    refetchLogs()
  }

  return (
    <AppLayout>
      <PageLayout title="Control de Acceso" description="Registro de ingresos y salidas">

        {/* Summary counters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Dentro ahora', value: insideCount, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
            { label: 'Residentes', value: residentCount, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
            { label: 'Visitantes', value: visitorCount, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-xl border-2 ${stat.bg} px-4 py-3 text-center`}>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-lg font-bold">Registrar Ingreso</span>
          </button>

          <button
            onClick={() => { setExitSearch(''); setExitOpen(true) }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-5 text-white shadow-lg shadow-red-200 hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">Registrar Salida</span>
              {insideCount > 0 && (
                <span className="rounded-full bg-white/30 px-2 py-0.5 text-sm font-bold">{insideCount}</span>
              )}
            </div>
          </button>
        </div>

        {/* Today's log */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Movimientos de hoy</h3>
          <DataTable
            columns={LOG_COLUMNS}
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
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        onSubmit={handleEntry}
        loading={registerEntry.isPending}
        guardId={guardId}
        propertyId={propertyId}
        inside={inside}
      />

      <RegisterExitModal
        open={exitOpen}
        onClose={() => setExitOpen(false)}
        inside={inside}
        onExit={handleExit}
        loadingId={registerExit.isPending ? 'pending' : null}
        guardId={guardId}
        search={exitSearch}
        onSearchChange={setExitSearch}
      />
    </AppLayout>
  )
}
