import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateAuthorizationDto, DayOfWeek } from '@/core/domain/models/visit-authorization.model'
import { DateRange } from '@/core/domain/value-objects/date-range.vo'
import { useResidents } from '@/shared/hooks/features/useResidents'
import { useVisitors } from '@/shared/hooks/features/useVisitors'
import { Button } from '@/ui/atoms'

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'MON', label: 'Lun' },
  { value: 'TUE', label: 'Mar' },
  { value: 'WED', label: 'Mié' },
  { value: 'THU', label: 'Jue' },
  { value: 'FRI', label: 'Vie' },
  { value: 'SAT', label: 'Sáb' },
  { value: 'SUN', label: 'Dom' },
]

const schema = z
  .object({
    type: z.enum(['ONE_TIME', 'RECURRING', 'PERMANENT']),
    visitorSource: z.enum(['EXISTING', 'QUICK']),
    residentId: z.string().min(1, 'Seleccione un residente'),
    visitorId: z.string().optional(),
    quickVisitorName: z.string().optional(),
    quickVisitorCompany: z.string().optional(),
    entryDate: z.string().optional(),
    entryTime: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    allowedDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).optional(),
    allowedTimeStart: z.string().optional(),
    allowedTimeEnd: z.string().optional(),
    observations: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.visitorSource === 'EXISTING' && !val.visitorId) {
      ctx.addIssue({ code: 'custom', path: ['visitorId'], message: 'Seleccione un visitante' })
    }
    if (val.visitorSource === 'QUICK' && !val.quickVisitorName?.trim()) {
      ctx.addIssue({ code: 'custom', path: ['quickVisitorName'], message: 'El nombre es requerido' })
    }
    if (val.type === 'ONE_TIME') {
      if (!val.entryDate) ctx.addIssue({ code: 'custom', path: ['entryDate'], message: 'La fecha de ingreso es requerida' })
      if (!val.entryTime) ctx.addIssue({ code: 'custom', path: ['entryTime'], message: 'La hora de ingreso es requerida' })
    }
    if (val.type === 'RECURRING') {
      if (!val.startDate) ctx.addIssue({ code: 'custom', path: ['startDate'], message: 'La fecha de inicio es requerida' })
      if (!val.endDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'La fecha de fin es requerida' })
      if (val.startDate && val.endDate) {
        const err = DateRange.validateRange(new Date(val.startDate), new Date(val.endDate))
        if (err) ctx.addIssue({ code: 'custom', path: ['endDate'], message: err })
      }
      if (!val.allowedDays?.length) {
        ctx.addIssue({ code: 'custom', path: ['allowedDays'], message: 'Seleccione al menos un día' })
      }
      if (!val.allowedTimeStart) ctx.addIssue({ code: 'custom', path: ['allowedTimeStart'], message: 'Hora de inicio requerida' })
      if (!val.allowedTimeEnd) ctx.addIssue({ code: 'custom', path: ['allowedTimeEnd'], message: 'Hora de fin requerida' })
    }
  })

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateAuthorizationDto) => Promise<void>
  loading?: boolean
}

export function AuthorizationFormModal({ open, onClose, onSubmit, loading }: Props) {
  const { data: residents = [] } = useResidents()
  const { data: visitors = [] } = useVisitors()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'ONE_TIME',
      visitorSource: 'EXISTING',
      allowedDays: [],
    },
  })

  const type = watch('type')
  const visitorSource = watch('visitorSource')
  const allowedDays = watch('allowedDays') ?? []

  useEffect(() => {
    if (!open) reset({ type: 'ONE_TIME', visitorSource: 'EXISTING', allowedDays: [] })
  }, [open, reset])

  // When type changes, clear time/date fields not relevant to new type
  useEffect(() => {
    setValue('entryDate', undefined)
    setValue('entryTime', undefined)
    setValue('startDate', undefined)
    setValue('endDate', undefined)
    setValue('allowedDays', [])
    setValue('allowedTimeStart', undefined)
    setValue('allowedTimeEnd', undefined)
  }, [type, setValue])

  function toggleDay(day: DayOfWeek) {
    const current = allowedDays as DayOfWeek[]
    if (current.includes(day)) {
      setValue('allowedDays', current.filter(d => d !== day))
    } else {
      setValue('allowedDays', [...current, day])
    }
  }

  async function onValid(values: FormValues) {
    const dto: CreateAuthorizationDto = {
      type: values.type,
      visitorSource: values.visitorSource,
      residentId: values.residentId,
      propertyId: 'prop-1',
      unitId: residents.find(r => r.id === values.residentId)?.unitId ?? '',
      observations: values.observations || undefined,
    }

    if (values.visitorSource === 'EXISTING') {
      dto.visitorId = values.visitorId
    } else {
      dto.quickVisitorName = values.quickVisitorName
      dto.quickVisitorCompany = values.quickVisitorCompany
    }

    if (values.type === 'ONE_TIME') {
      dto.entryDate = values.entryDate
      dto.entryTime = values.entryTime
    }

    if (values.type === 'RECURRING') {
      dto.startDate = values.startDate ? new Date(values.startDate) : undefined
      dto.endDate = values.endDate ? new Date(values.endDate) : undefined
      dto.allowedDays = values.allowedDays as DayOfWeek[]
      dto.allowedTimeStart = values.allowedTimeStart
      dto.allowedTimeEnd = values.allowedTimeEnd
    }

    await onSubmit(dto)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Nueva autorización</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="px-6 py-5 space-y-5">

          {/* Authorization type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de autorización</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'ONE_TIME', label: 'Una vez', desc: 'Un día y hora específicos' },
                { value: 'RECURRING', label: 'Temporal', desc: 'Rango de fechas y días' },
                { value: 'PERMANENT', label: 'Permanente', desc: 'Sin restricción de tiempo' },
              ] as const).map(opt => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-colors ${
                    type === opt.value
                      ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input type="radio" {...register('type')} value={opt.value} className="sr-only" />
                  <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* ONE_TIME: entry date + time */}
          {type === 'ONE_TIME' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de ingreso</label>
                <input
                  type="date"
                  {...register('entryDate')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                />
                {errors.entryDate && <p className="mt-1 text-xs text-red-500">{errors.entryDate.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Hora de ingreso</label>
                <input
                  type="time"
                  {...register('entryTime')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                />
                {errors.entryTime && <p className="mt-1 text-xs text-red-500">{errors.entryTime.message}</p>}
              </div>
            </div>
          )}

          {/* RECURRING: date range + days + time range */}
          {type === 'RECURRING' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha inicio</label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                  />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha fin</label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                  />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Días permitidos</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        (allowedDays as DayOfWeek[]).includes(d.value)
                          ? 'bg-[#1e3a5f] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
                {errors.allowedDays && <p className="mt-1 text-xs text-red-500">{errors.allowedDays.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hora de ingreso</label>
                  <input
                    type="time"
                    {...register('allowedTimeStart')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                  />
                  {errors.allowedTimeStart && <p className="mt-1 text-xs text-red-500">{errors.allowedTimeStart.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Hora límite</label>
                  <input
                    type="time"
                    {...register('allowedTimeEnd')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                  />
                  {errors.allowedTimeEnd && <p className="mt-1 text-xs text-red-500">{errors.allowedTimeEnd.message}</p>}
                </div>
              </div>
            </div>
          )}

          {type === 'PERMANENT' && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
              El visitante podrá ingresar en cualquier momento sin restricción de horario.
            </div>
          )}

          {/* Resident selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Residente que autoriza</label>
            <select
              {...register('residentId')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
            >
              <option value="">Seleccione un residente...</option>
              {residents.filter(r => r.isActive).map(r => (
                <option key={r.id} value={r.id}>
                  {r.name.full} — Apt. {r.unitNumber}
                </option>
              ))}
            </select>
            {errors.residentId && <p className="mt-1 text-xs text-red-500">{errors.residentId.message}</p>}
          </div>

          {/* Visitor source toggle */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Visitante a autorizar</label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setValue('visitorSource', 'EXISTING')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  visitorSource === 'EXISTING' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Visitante registrado
              </button>
              <button
                type="button"
                onClick={() => setValue('visitorSource', 'QUICK')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  visitorSource === 'QUICK' ? 'bg-[#1e3a5f] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Ingreso rápido
              </button>
            </div>
          </div>

          {/* EXISTING visitor */}
          {visitorSource === 'EXISTING' && (
            <div>
              <select
                {...register('visitorId')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
              >
                <option value="">Seleccione un visitante...</option>
                {visitors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name.full} — {v.document.format()}
                  </option>
                ))}
              </select>
              {errors.visitorId && <p className="mt-1 text-xs text-red-500">{errors.visitorId.message}</p>}
            </div>
          )}

          {/* QUICK visitor */}
          {visitorSource === 'QUICK' && (
            <div className="space-y-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs text-amber-700 font-medium">
                Domiciliario, empleado temporal, técnico de instalación u otro visitante de un solo día
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre completo *</label>
                <input
                  {...register('quickVisitorName')}
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                />
                {errors.quickVisitorName && <p className="mt-1 text-xs text-red-500">{errors.quickVisitorName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empresa / servicio</label>
                <input
                  {...register('quickVisitorCompany')}
                  placeholder="Ej. Claro, Rappi, contratista..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea
              {...register('observations')}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              Crear autorización
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
