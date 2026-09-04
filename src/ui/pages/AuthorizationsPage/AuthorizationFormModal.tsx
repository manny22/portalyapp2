import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateAuthorizationDto } from '@/core/domain/models/visit-authorization.model'
import { useResidents } from '@/shared/hooks/features/useResidents'
import { useVisitors } from '@/shared/hooks/features/useVisitors'
import { Button } from '@/ui/atoms'

const schema = z
  .object({
    residentId: z.string().min(1, 'Seleccione un residente'),
    visitorId: z.string().min(1, 'Seleccione un visitante'),
    validFrom: z.string().min(1, 'La fecha de inicio es requerida'),
    validUntil: z.string().min(1, 'La fecha de fin es requerida'),
    notes: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.validFrom && val.validUntil && new Date(val.validUntil) <= new Date(val.validFrom)) {
      ctx.addIssue({
        code: 'custom',
        path: ['validUntil'],
        message: 'Debe ser posterior a la fecha de inicio',
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateAuthorizationDto) => Promise<void>
  loading?: boolean
  propertyId: string
}

export function AuthorizationFormModal({ open, onClose, onSubmit, loading, propertyId }: Props) {
  const { data: residents = [] } = useResidents()
  const { data: visitors = [] } = useVisitors()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!open) reset({})
  }, [open, reset])

  async function onValid(values: FormValues) {
    const resident = residents.find(r => r.id === values.residentId)
    const dto: CreateAuthorizationDto = {
      residentId: values.residentId,
      visitorId: values.visitorId,
      unitId: resident?.unitId ?? '',
      propertyId,
      validFrom: new Date(values.validFrom).toISOString(),
      validUntil: new Date(values.validUntil).toISOString(),
      notes: values.notes || undefined,
    }

    await onSubmit(dto)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Nueva autorización</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onValid)} className="px-6 py-5 space-y-5">
          {/* Resident selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Residente que autoriza
            </label>
            <select
              {...register('residentId')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
            >
              <option value="">Seleccione un residente...</option>
              {residents
                .filter(r => r.isActive)
                .map(r => (
                  <option key={r.id} value={r.id}>
                    {r.firstName} {r.lastName}
                  </option>
                ))}
            </select>
            {errors.residentId && (
              <p className="mt-1 text-xs text-red-500">{errors.residentId.message}</p>
            )}
          </div>

          {/* Visitor selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Visitante a autorizar
            </label>
            <select
              {...register('visitorId')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
            >
              <option value="">Seleccione un visitante...</option>
              {visitors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.firstName} {v.lastName} — {v.documentType} {v.documentNumber}
                </option>
              ))}
            </select>
            {errors.visitorId && (
              <p className="mt-1 text-xs text-red-500">{errors.visitorId.message}</p>
            )}
          </div>

          {/* Validity range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Válido desde</label>
              <input
                type="datetime-local"
                {...register('validFrom')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
              />
              {errors.validFrom && (
                <p className="mt-1 text-xs text-red-500">{errors.validFrom.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Válido hasta</label>
              <input
                type="datetime-local"
                {...register('validUntil')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#1e3a5f] focus:outline-none"
              />
              {errors.validUntil && (
                <p className="mt-1 text-xs text-red-500">{errors.validUntil.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones</label>
            <textarea
              {...register('notes')}
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
