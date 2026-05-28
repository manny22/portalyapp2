import { useState, useMemo, useRef, useEffect } from 'react'
import type { AccessLog, RegisterEntryDto } from '@/core/domain/models/access-log.model'
import type { Resident } from '@/core/domain/models/resident.model'
import type { Visitor } from '@/core/domain/models/visitor.model'
import type { VisitAuthorization } from '@/core/domain/models/visit-authorization.model'
import { useResidents } from '@/shared/hooks/features/useResidents'
import { useVisitors } from '@/shared/hooks/features/useVisitors'
import { useAuthorizations } from '@/shared/hooks/features/useAuthorizations'
import { useVehicles } from '@/shared/hooks/features/useVehicles'
import { Button } from '@/ui/atoms'

type SelectionKind =
  | { kind: 'resident'; resident: Resident; vehiclePlate?: string }
  | { kind: 'visitor'; visitor: Visitor; authorization?: VisitAuthorization }
  | { kind: 'authorization'; authorization: VisitAuthorization }
  | { kind: 'quick'; name: string; unitNumber: string; unitId: string }

const REASON_OPTIONS = [
  { value: 'Visita familiar', label: 'Familiar' },
  { value: 'Servicio técnico', label: 'Técnico' },
  { value: 'Domicilio', label: 'Domicilio' },
  { value: 'Reunión', label: 'Reunión' },
  { value: 'Otro', label: 'Otro' },
]

const AUTH_TYPE_LABELS: Record<string, string> = {
  ONE_TIME: 'Una vez', RECURRING: 'Temporal', PERMANENT: 'Permanente',
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: RegisterEntryDto) => Promise<void>
  loading?: boolean
  guardId: string
  propertyId: string
  inside: AccessLog[]
}

export function RegisterEntryModal({ open, onClose, onSubmit, loading, guardId, propertyId, inside }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<SelectionKind | null>(null)
  const [reason, setReason] = useState('')
  const [showQuickForm, setShowQuickForm] = useState(false)
  const [quickName, setQuickName] = useState('')
  const [quickUnitId, setQuickUnitId] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: residents = [] } = useResidents()
  const { data: visitors = [] } = useVisitors()
  const { data: authorizations = [] } = useAuthorizations({ propertyId })
  const { data: vehicles = [] } = useVehicles()

  const activeResidents = useMemo(() => residents.filter(r => r.isActive), [residents])

  // Sets for quick lookup of who's already inside
  const insideResidentIds = useMemo(
    () => new Set(inside.filter(l => l.residentId).map(l => l.residentId!)),
    [inside]
  )
  const insideVisitorIds = useMemo(
    () => new Set(inside.filter(l => l.visitorId).map(l => l.visitorId!)),
    [inside]
  )

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(null)
      setReason('')
      setShowQuickForm(false)
      setQuickName('')
      setQuickUnitId('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // Compute a blocking reason for the currently selected person (shown before submit)
  const blockingReason = useMemo((): string | null => {
    if (!selected) return null
    if (selected.kind === 'resident') {
      if (insideResidentIds.has(selected.resident.id))
        return 'Este residente ya se encuentra dentro de la copropiedad'
      return null
    }
    if (selected.kind === 'visitor') {
      if (insideVisitorIds.has(selected.visitor.id))
        return 'Este visitante ya se encuentra dentro de la copropiedad'
      if (!selected.authorization)
        return 'El visitante no cuenta con una autorización de ingreso activa'
      if (selected.authorization.status === 'USED' && selected.authorization.type === 'ONE_TIME')
        return 'Esta autorización de un solo uso ya fue utilizada'
      if (selected.authorization.status === 'CANCELLED')
        return 'La autorización está cancelada'
      if (selected.authorization.validityPeriod?.isExpired())
        return 'La autorización ha expirado'
      return null
    }
    if (selected.kind === 'authorization') {
      const a = selected.authorization
      if (a.visitorId && insideVisitorIds.has(a.visitorId))
        return 'Este visitante ya se encuentra dentro de la copropiedad'
      if (a.status === 'USED' && a.type === 'ONE_TIME')
        return 'Esta autorización de un solo uso ya fue utilizada'
      if (a.status === 'CANCELLED') return 'La autorización está cancelada'
      if (a.validityPeriod?.isExpired()) return 'La autorización ha expirado'
      return null
    }
    // quick visitor — never blocked
    return null
  }, [selected, insideResidentIds, insideVisitorIds])

  const canSubmit = selected !== null && blockingReason === null && !loading

  // Build search results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    type Result =
      | { type: 'resident'; resident: Resident; vehiclePlate?: string; alreadyInside: boolean }
      | { type: 'visitor'; visitor: Visitor; authorization?: VisitAuthorization; alreadyInside: boolean }
      | { type: 'authorization'; authorization: VisitAuthorization }

    const found: Result[] = []

    for (const r of residents) {
      if (!r.isActive) continue
      const nameMatch = r.name.full.toLowerCase().includes(q)
      const matchingVehicle = vehicles.find(
        v => v.residentId === r.id && v.plate.format().toLowerCase().includes(q)
      )
      if (nameMatch || matchingVehicle) {
        found.push({
          type: 'resident',
          resident: r,
          vehiclePlate: matchingVehicle?.plate.format(),
          alreadyInside: insideResidentIds.has(r.id),
        })
      }
    }

    for (const v of visitors) {
      const nameMatch = v.name.full.toLowerCase().includes(q)
      const docMatch = v.document.format().toLowerCase().includes(q)
      if (nameMatch || docMatch) {
        const auth = authorizations.find(
          a => a.visitorId === v.id && (a.status === 'ACTIVE' || a.status === 'PENDING')
        )
        found.push({
          type: 'visitor',
          visitor: v,
          authorization: auth,
          alreadyInside: insideVisitorIds.has(v.id),
        })
      }
    }

    // Authorization code search — only active
    for (const a of authorizations) {
      if (!a.code.value.includes(q.toUpperCase())) continue
      if (a.status !== 'ACTIVE' && a.status !== 'PENDING') continue
      if (!found.some(f => f.type === 'visitor' && f.visitor.id === a.visitorId)) {
        found.push({ type: 'authorization', authorization: a })
      }
    }

    return found.slice(0, 8)
  }, [query, residents, visitors, authorizations, vehicles, insideResidentIds, insideVisitorIds])

  function selectResident(resident: Resident, vehiclePlate?: string) {
    setSelected({ kind: 'resident', resident, vehiclePlate })
    setQuery(resident.name.full)
    setShowQuickForm(false)
  }

  function selectVisitor(visitor: Visitor, authorization?: VisitAuthorization) {
    setSelected({ kind: 'visitor', visitor, authorization })
    setQuery(visitor.name.full)
    setShowQuickForm(false)
  }

  function selectAuthorization(authorization: VisitAuthorization) {
    setSelected({ kind: 'authorization', authorization })
    setQuery(authorization.code.value)
    setShowQuickForm(false)
  }

  function confirmQuickVisitor() {
    if (!quickName.trim() || !quickUnitId) return
    const res = activeResidents.find(r => r.unitId === quickUnitId)
    setSelected({
      kind: 'quick',
      name: quickName.trim(),
      unitNumber: res?.unitNumber ?? '',
      unitId: quickUnitId,
    })
    setQuery(quickName.trim())
    setShowQuickForm(false)
  }

  async function handleConfirm() {
    if (!selected || blockingReason) return

    let dto: RegisterEntryDto

    if (selected.kind === 'resident') {
      dto = {
        personType: 'RESIDENT',
        residentId: selected.resident.id,
        vehiclePlate: selected.vehiclePlate,
        unitId: selected.resident.unitId,
        guardId,
        propertyId,
      }
    } else if (selected.kind === 'visitor') {
      dto = {
        personType: 'VISITOR',
        visitorId: selected.visitor.id,
        authorizationId: selected.authorization?.id,
        unitId: selected.authorization?.unitId,
        visitReason: reason || undefined,
        guardId,
        propertyId,
      }
    } else if (selected.kind === 'authorization') {
      dto = {
        personType: 'VISITOR',
        visitorId: selected.authorization.visitorId ?? undefined,
        authorizationId: selected.authorization.id,
        unitId: selected.authorization.unitId,
        visitReason: reason || undefined,
        guardId,
        propertyId,
      }
    } else {
      dto = {
        personType: 'VISITOR',
        unitId: selected.unitId,
        visitReason: reason || undefined,
        observations: `Visitante rápido: ${selected.name}`,
        guardId,
        propertyId,
      }
    }

    await onSubmit(dto)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[5vh] px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between bg-green-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Registrar Ingreso</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Search box */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setSelected(null) }}
              placeholder="Placa, nombre o código de autorización..."
              className="w-full rounded-xl border-2 border-slate-200 py-3 pl-10 pr-4 text-base focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Search results */}
          {results.length > 0 && !selected && (
            <div className="space-y-2">
              {results.map((r, i) => {
                if (r.type === 'resident') {
                  return (
                    <button
                      key={i}
                      onClick={() => selectResident(r.resident, r.vehiclePlate)}
                      className="w-full flex items-center gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-left hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{r.resident.name.full}</p>
                        <p className="text-sm text-slate-500">Apt. {r.resident.unitNumber} · {r.resident.blockName}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">Residente</span>
                        {r.vehiclePlate && <span className="text-xs font-mono text-slate-500">{r.vehiclePlate}</span>}
                        {r.alreadyInside && (
                          <span className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">Ya dentro</span>
                        )}
                      </div>
                    </button>
                  )
                }
                if (r.type === 'visitor') {
                  const hasAuth = !!r.authorization
                  return (
                    <button
                      key={i}
                      onClick={() => selectVisitor(r.visitor, r.authorization)}
                      className="w-full flex items-center gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 p-3 text-left hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800">{r.visitor.name.full}</p>
                        <p className="text-sm text-slate-500">{r.visitor.document.format()}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        {r.alreadyInside ? (
                          <span className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">Ya dentro</span>
                        ) : hasAuth ? (
                          <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">✓ Autorizado</span>
                        ) : (
                          <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">Sin autorización</span>
                        )}
                        {r.authorization && (
                          <span className="text-xs text-slate-400">Apt. {r.authorization.unitNumber}</span>
                        )}
                      </div>
                    </button>
                  )
                }
                if (r.type === 'authorization') {
                  const a = r.authorization
                  const visitorInside = a.visitorId ? insideVisitorIds.has(a.visitorId) : false
                  return (
                    <button
                      key={i}
                      onClick={() => selectAuthorization(a)}
                      className="w-full flex items-center gap-3 rounded-xl border-2 border-green-200 bg-green-50 p-3 text-left hover:border-green-400 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 font-mono">{a.code.value}</p>
                        <p className="text-sm text-slate-600">{a.visitorName} → Apt. {a.unitNumber}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-medium text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                          {AUTH_TYPE_LABELS[a.type]}
                        </span>
                        {visitorInside && (
                          <span className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">Ya dentro</span>
                        )}
                      </div>
                    </button>
                  )
                }
                return null
              })}
            </div>
          )}

          {/* No results + quick visitor option */}
          {query.length >= 2 && results.length === 0 && !selected && !showQuickForm && (
            <div className="text-center py-3">
              <p className="text-sm text-slate-500 mb-3">Sin coincidencias en el sistema</p>
              <button
                onClick={() => setShowQuickForm(true)}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Registrar visitante sin registro previo
              </button>
            </div>
          )}

          {/* Quick visitor form */}
          {showQuickForm && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800">Visitante sin registro</p>
              <input
                autoFocus
                value={quickName}
                onChange={e => setQuickName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
              <select
                value={quickUnitId}
                onChange={e => setQuickUnitId(e.target.value)}
                className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="">Visita al apartamento...</option>
                {activeResidents.map(r => (
                  <option key={r.id} value={r.unitId}>
                    Apt. {r.unitNumber} — {r.name.full}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowQuickForm(false)}>Cancelar</Button>
                <Button size="sm" onClick={confirmQuickVisitor} disabled={!quickName.trim() || !quickUnitId}>
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {/* Selection confirmation panel */}
          {selected && (
            <div className={`rounded-xl border-2 p-4 space-y-3 ${blockingReason ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              <div className="flex items-start gap-3">
                {/* Status icon */}
                {blockingReason ? (
                  <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}

                <div className="flex-1 min-w-0">
                  {/* Person info */}
                  {selected.kind === 'resident' && (
                    <>
                      <p className="font-semibold text-slate-800">{selected.resident.name.full}</p>
                      <p className="text-sm text-slate-500">Residente · Apt. {selected.resident.unitNumber}</p>
                      {selected.vehiclePlate && (
                        <p className="text-xs font-mono text-slate-400 mt-0.5">{selected.vehiclePlate}</p>
                      )}
                    </>
                  )}
                  {selected.kind === 'visitor' && (
                    <>
                      <p className="font-semibold text-slate-800">{selected.visitor.name.full}</p>
                      <p className="text-sm text-slate-500">
                        {selected.visitor.document.format()}
                        {selected.authorization && ` · Apt. ${selected.authorization.unitNumber}`}
                      </p>
                      {selected.authorization && (
                        <p className="text-xs text-green-700 mt-0.5 font-medium">
                          ✓ Autorización {AUTH_TYPE_LABELS[selected.authorization.type]}
                        </p>
                      )}
                    </>
                  )}
                  {selected.kind === 'authorization' && (
                    <>
                      <p className="font-semibold text-slate-800">{selected.authorization.visitorName}</p>
                      <p className="text-sm text-slate-500">
                        Código <span className="font-mono">{selected.authorization.code.value}</span> · Apt. {selected.authorization.unitNumber}
                      </p>
                      <p className="text-xs text-green-700 mt-0.5 font-medium">
                        ✓ Autorización {AUTH_TYPE_LABELS[selected.authorization.type]}
                      </p>
                    </>
                  )}
                  {selected.kind === 'quick' && (
                    <>
                      <p className="font-semibold text-slate-800">{selected.name}</p>
                      <p className="text-sm text-slate-500">Visitante rápido · Apt. {selected.unitNumber}</p>
                    </>
                  )}

                  {/* Blocking reason alert */}
                  {blockingReason && (
                    <p className="mt-2 text-sm font-semibold text-red-700">{blockingReason}</p>
                  )}
                </div>

                <button
                  onClick={() => { setSelected(null); setQuery(''); inputRef.current?.focus() }}
                  className="shrink-0 text-slate-400 hover:text-slate-600 text-sm"
                >
                  Cambiar
                </button>
              </div>

              {/* Reason chips — only when not blocked and not resident */}
              {!blockingReason && selected.kind !== 'resident' && (
                <div>
                  <p className="text-xs text-slate-600 font-medium mb-1.5">Motivo de visita</p>
                  <div className="flex flex-wrap gap-2">
                    {REASON_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setReason(r => r === opt.value ? '' : opt.value)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                          reason === opt.value
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-slate-100 p-4">
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold transition-all ${
              canSubmit
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {loading ? 'Registrando...' : canSubmit ? 'Registrar Ingreso' : blockingReason ? 'Ingreso no permitido' : 'Seleccione una persona'}
          </button>
        </div>
      </div>
    </div>
  )
}
