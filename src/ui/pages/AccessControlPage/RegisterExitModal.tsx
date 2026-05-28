import { useState } from 'react'
import type { AccessLog, RegisterExitDto } from '@/core/domain/models/access-log.model'

const PERSON_TYPE_ICON: Record<string, { bg: string; icon: string }> = {
  RESIDENT: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  VISITOR: { bg: 'bg-amber-100', icon: 'text-amber-600' },
  DELIVERY: { bg: 'bg-orange-100', icon: 'text-orange-600' },
  SERVICE_PROVIDER: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  STAFF: { bg: 'bg-slate-100', icon: 'text-slate-600' },
}

const PERSON_TYPE_LABELS: Record<string, string> = {
  RESIDENT: 'Residente', VISITOR: 'Visitante', DELIVERY: 'Domicilio',
  SERVICE_PROVIDER: 'Proveedor', STAFF: 'Personal',
}

function timeAgo(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60_000)
  if (mins < 1) return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h ${mins % 60}min`
  return date.toLocaleDateString('es-CO')
}

interface Props {
  open: boolean
  onClose: () => void
  inside: AccessLog[]
  onExit: (data: RegisterExitDto) => Promise<void>
  loadingId?: string | null
  guardId: string
  search: string
  onSearchChange: (v: string) => void
}

export function RegisterExitModal({
  open, onClose, inside, onExit, loadingId, guardId, search, onSearchChange
}: Props) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const filtered = inside.filter(log => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const name = (log.visitorName ?? log.residentName ?? '').toLowerCase()
    const plate = (log.vehiclePlate ?? '').toLowerCase()
    return name.includes(q) || plate.includes(q)
  })

  async function handleExit(log: AccessLog) {
    setConfirmingId(log.id)
    try {
      await onExit({ accessLogId: log.id, guardId })
    } finally {
      setConfirmingId(null)
    }
  }

  if (!open) return null

  const iconStyle = (personType: string) => PERSON_TYPE_ICON[personType] ?? PERSON_TYPE_ICON['VISITOR']

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[5vh] px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between bg-red-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <div>
              <h2 className="text-lg font-bold text-white">Registrar Salida</h2>
              <p className="text-red-200 text-xs">{inside.length} {inside.length === 1 ? 'persona' : 'personas'} dentro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        {/* Search (only when there are multiple people) */}
        {inside.length > 4 && (
          <div className="px-5 pt-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Filtrar por nombre o placa..."
                className="w-full rounded-xl border-2 border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-red-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* People list */}
        <div className="overflow-y-auto flex-1 p-5 space-y-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <svg className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium">Nadie dentro del conjunto</p>
              <p className="text-sm text-slate-400 mt-1">No hay personas con ingreso activo</p>
            </div>
          )}

          {filtered.map(log => {
            const name = log.visitorName ?? log.residentName ?? '—'
            const colors = iconStyle(log.personType)
            const isExiting = confirmingId === log.id || loadingId === log.id

            return (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border-2 border-slate-100 bg-white p-3"
              >
                {/* Avatar icon */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
                  {log.personType === 'RESIDENT' ? (
                    <svg className={`h-5 w-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ) : (
                    <svg className={`h-5 w-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-medium rounded-full px-1.5 py-0.5 ${colors.bg} ${colors.icon}`}>
                      {PERSON_TYPE_LABELS[log.personType]}
                    </span>
                    {log.unitNumber && (
                      <span className="text-xs text-slate-500">Apt. {log.unitNumber}</span>
                    )}
                    {log.vehiclePlate && (
                      <span className="font-mono text-xs text-slate-400">{log.vehiclePlate}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{timeAgo(log.enteredAt)}</p>
                </div>

                {/* Exit button — large tap target */}
                <button
                  onClick={() => handleExit(log)}
                  disabled={isExiting}
                  className={`shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    isExiting
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm'
                  }`}
                >
                  {isExiting ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                  )}
                  Salida
                </button>
              </div>
            )
          })}
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-center">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
