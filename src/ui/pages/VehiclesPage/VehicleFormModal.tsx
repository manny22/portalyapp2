import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import type { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleOwnerType } from '@/core/domain/models/vehicle.model'
import type { ParkingSpotType } from '@/core/domain/models/parking-spot.model'
import { LicensePlate } from '@/core/domain/value-objects/license-plate.vo'
import { checkParkingEligibility, PARKING_SPOT_TYPE_LABELS } from '@/core/domain/models/parking-spot.model'
import { useResidents } from '@/shared/hooks/features/useResidents'
import { useVisitors } from '@/shared/hooks/features/useVisitors'
import { useParkingSpots } from '@/shared/hooks/features/useVehicles'

// ── Schemas ────────────────────────────────────────────────────────────────────

const createSchema = z
  .object({
    plate: z.string().superRefine((val, ctx) => {
      const err = LicensePlate.validate(val)
      if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
    }),
    type: z.enum(['CAR', 'MOTORCYCLE', 'BICYCLE', 'OTHER'] as const),
    brand: z.string().max(50).optional(),
    model: z.string().max(50).optional(),
    color: z.string().max(50).optional(),
    ownerType: z.enum(['RESIDENT', 'VISITOR'] as const),
    residentId: z.string().optional(),
    visitorId: z.string().optional(),
    parkingSpotId: z.string().optional(),
    hasCommonParkingAuthorization: z.boolean().optional(),
    commonParkingAuthorizationRef: z.string().max(100).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.ownerType === 'RESIDENT' && !val.residentId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['residentId'], message: 'Seleccione el residente propietario' })
    }
    if (val.ownerType === 'VISITOR' && !val.visitorId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['visitorId'], message: 'Seleccione el visitante propietario del vehículo' })
    }
  })

const editSchema = z.object({
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  parkingSpotId: z.string().optional(),
  hasCommonParkingAuthorization: z.boolean().optional(),
  commonParkingAuthorizationRef: z.string().max(100).optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues

// ── Static options ─────────────────────────────────────────────────────────────

const VEHICLE_TYPE_OPTIONS = [
  { value: 'CAR', label: 'Automóvil' },
  { value: 'MOTORCYCLE', label: 'Motocicleta' },
  { value: 'BICYCLE', label: 'Bicicleta' },
  { value: 'OTHER', label: 'Otro' },
]

const SPOT_TYPE_BADGE: Record<ParkingSpotType, { bg: string; text: string }> = {
  PRIVATE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  COMMON:  { bg: 'bg-slate-100', text: 'text-slate-700' },
  VISITOR: { bg: 'bg-amber-100', text: 'text-amber-700' },
}

const CREATE_DEFAULTS: FormValues = {
  plate: '',
  type: 'CAR',
  brand: '',
  model: '',
  color: '',
  ownerType: 'RESIDENT',
  residentId: '',
  visitorId: '',
  parkingSpotId: '',
  hasCommonParkingAuthorization: false,
  commonParkingAuthorizationRef: '',
}

// ── Component ──────────────────────────────────────────────────────────────────

interface VehicleFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateVehicleDto | UpdateVehicleDto) => void
  loading?: boolean
  vehicle?: Vehicle | null
}

export function VehicleFormModal({ open, onClose, onSubmit, loading = false, vehicle }: VehicleFormModalProps) {
  const isEdit = Boolean(vehicle)

  const { data: residents = [] } = useResidents()
  const { data: visitors = [] } = useVisitors()
  const { data: allSpots = [] } = useParkingSpots({ propertyId: 'prop-1' })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? (editSchema as unknown as typeof createSchema) : createSchema),
    defaultValues: CREATE_DEFAULTS,
  })

  useEffect(() => {
    if (open) {
      reset(
        vehicle
          ? {
              plate: vehicle.plate.value,
              type: vehicle.type,
              brand: vehicle.brand ?? '',
              model: vehicle.model ?? '',
              color: vehicle.color ?? '',
              ownerType: vehicle.ownerType,
              residentId: vehicle.residentId ?? '',
              visitorId: vehicle.visitorId ?? '',
              parkingSpotId: vehicle.parkingSpotId ?? '',
              hasCommonParkingAuthorization: vehicle.hasCommonParkingAuthorization,
              commonParkingAuthorizationRef: vehicle.commonParkingAuthorizationRef ?? '',
            }
          : CREATE_DEFAULTS,
      )
    }
  }, [open, vehicle, reset])

  const ownerType = watch('ownerType') as VehicleOwnerType
  const residentId = watch('residentId')
  const visitorId = watch('visitorId')
  const parkingSpotId = watch('parkingSpotId')
  const hasCommonAuth = watch('hasCommonParkingAuthorization')

  // Get selected resident's unit for PRIVATE spot eligibility check
  const selectedResident = useMemo(
    () => residents.find(r => r.id === residentId),
    [residents, residentId],
  )
  const selectedVisitor = useMemo(
    () => visitors.find(v => v.id === visitorId),
    [visitors, visitorId],
  )
  const selectedSpot = useMemo(
    () => allSpots.find(s => s.id === parkingSpotId),
    [allSpots, parkingSpotId],
  )

  // Filter available spots based on owner type and eligibility
  // A spot is eligible if: not occupied (or currently assigned to this vehicle) AND passes eligibility rules
  const eligibleSpots = useMemo(() => {
    return allSpots.filter(spot => {
      const isCurrentSpot = vehicle?.parkingSpotId === spot.id
      if (spot.isOccupied && !isCurrentSpot) return false

      const result = checkParkingEligibility(spot.type, ownerType, {
        spotUnitId: spot.unitId ?? undefined,
        vehicleUnitId: selectedResident?.unitId,
        hasCommonAuthorization: hasCommonAuth ?? false,
      })
      return result.allowed
    })
  }, [allSpots, ownerType, selectedResident, hasCommonAuth, vehicle])

  // Spot eligibility warning for currently selected spot
  const spotEligibilityWarning = useMemo(() => {
    if (!selectedSpot) return null
    const result = checkParkingEligibility(selectedSpot.type, ownerType, {
      spotUnitId: selectedSpot.unitId ?? undefined,
      vehicleUnitId: selectedResident?.unitId,
      hasCommonAuthorization: hasCommonAuth ?? false,
    })
    return result.allowed ? null : result.reason
  }, [selectedSpot, ownerType, selectedResident, hasCommonAuth])

  // When owner type changes, reset parking spot selection
  useEffect(() => {
    setValue('parkingSpotId', '')
    setValue('hasCommonParkingAuthorization', false)
    setValue('commonParkingAuthorizationRef', '')
  }, [ownerType, setValue])

  // When resident changes, also reset parking (eligibility may change)
  useEffect(() => {
    setValue('parkingSpotId', '')
  }, [residentId, setValue])

  const residentOptions = useMemo(
    () => [
      { value: '', label: 'Seleccionar residente...' },
      ...residents.filter(r => r.isActive).map(r => ({
        value: r.id,
        label: `${r.name.full} — Apt. ${r.unitNumber}`,
      })),
    ],
    [residents],
  )

  const visitorOptions = useMemo(
    () => [
      { value: '', label: 'Seleccionar visitante...' },
      ...visitors.map(v => ({
        value: v.id,
        label: `${v.name.full} — ${v.document.format()}`,
      })),
    ],
    [visitors],
  )

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateVehicleDto = {
        brand: values.brand || undefined,
        model: values.model || undefined,
        color: values.color || undefined,
        parkingSpotId: values.parkingSpotId || null,
        hasCommonParkingAuthorization: values.hasCommonParkingAuthorization ?? false,
        commonParkingAuthorizationRef: values.commonParkingAuthorizationRef || null,
      }
      onSubmit(dto)
    } else {
      const dto: CreateVehicleDto = {
        plate: values.plate,
        type: values.type,
        brand: values.brand || undefined,
        model: values.model || undefined,
        color: values.color || undefined,
        ownerType: values.ownerType,
        residentId: values.ownerType === 'RESIDENT' ? values.residentId : undefined,
        visitorId: values.ownerType === 'VISITOR' ? values.visitorId : undefined,
        unitId: selectedResident?.unitId,
        propertyId: 'prop-1',
        parkingSpotId: values.parkingSpotId || undefined,
        hasCommonParkingAuthorization: values.hasCommonParkingAuthorization ?? false,
        commonParkingAuthorizationRef: values.commonParkingAuthorizationRef || undefined,
      }
      onSubmit(dto)
    }
  }

  const showCommonAuthFields =
    ownerType === 'VISITOR' && selectedSpot?.type === 'COMMON'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar vehículo' : 'Registrar vehículo'}
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit(submit)}
          confirmLabel={isEdit ? 'Guardar cambios' : 'Registrar'}
          loading={loading}
        />
      }
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>

        {/* ── Datos del vehículo ─────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Datos del vehículo</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Placa"
              required={!isEdit}
              error={errors.plate?.message}
              hint={LicensePlate.hint()}
              htmlFor="plate"
            >
              <Input
                id="plate"
                placeholder="ABC123"
                disabled={isEdit}
                error={Boolean(errors.plate)}
                className="uppercase"
                {...register('plate')}
              />
            </FormField>

            <FormField label="Tipo de vehículo" required error={errors.type?.message} htmlFor="vtype">
              <Select id="vtype" options={VEHICLE_TYPE_OPTIONS} {...register('type')} />
            </FormField>

            <FormField label="Marca" htmlFor="brand" error={errors.brand?.message}>
              <Input id="brand" placeholder="Ej. Toyota" {...register('brand')} />
            </FormField>

            <FormField label="Modelo / Referencia" htmlFor="model" error={errors.model?.message}>
              <Input id="model" placeholder="Ej. Corolla 2022" {...register('model')} />
            </FormField>

            <FormField label="Color" htmlFor="color" error={errors.color?.message}>
              <Input id="color" placeholder="Ej. Blanco perla" {...register('color')} />
            </FormField>
          </div>
        </section>

        {/* ── Propietario ────────────────────────────────────────────────────── */}
        <section>
          {isEdit ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Propietario</p>
              <p className="text-sm font-medium text-slate-800">
                {vehicle!.ownerType === 'RESIDENT'
                  ? `${vehicle!.residentName} — Apt. ${vehicle!.unitNumber}`
                  : vehicle!.visitorName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {vehicle!.ownerType === 'RESIDENT' ? 'Residente' : 'Visitante'}
              </p>
              <p className="text-xs text-slate-400 mt-1 italic">El propietario no puede modificarse.</p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Propietario del vehículo</p>
              {/* Owner type toggle */}
              <div className="mb-4 flex rounded-lg border border-slate-200 overflow-hidden">
                {(['RESIDENT', 'VISITOR'] as VehicleOwnerType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('ownerType', t)}
                    className={[
                      'flex-1 py-2 text-sm font-medium transition-colors',
                      ownerType === t
                        ? 'bg-[#1e3a5f] text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {t === 'RESIDENT' ? 'Residente' : 'Visitante'}
                  </button>
                ))}
              </div>

              {ownerType === 'RESIDENT' ? (
                <FormField label="Residente" required error={errors.residentId?.message} htmlFor="residentId">
                  <Select
                    id="residentId"
                    options={residentOptions}
                    error={Boolean(errors.residentId)}
                    {...register('residentId')}
                  />
                </FormField>
              ) : (
                <FormField label="Visitante" required error={errors.visitorId?.message} htmlFor="visitorId">
                  <Select
                    id="visitorId"
                    options={visitorOptions}
                    error={Boolean(errors.visitorId)}
                    {...register('visitorId')}
                  />
                </FormField>
              )}

              {/* Parking rules info banner */}
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500 leading-relaxed">
                {ownerType === 'RESIDENT' ? (
                  <>
                    <span className="font-medium text-slate-700">Residente:</span> puede usar parqueadero{' '}
                    <span className="font-medium">privado</span> (de su unidad) o{' '}
                    <span className="font-medium">común</span>. No puede usar parqueadero de visitantes.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-slate-700">Visitante:</span> puede usar parqueadero{' '}
                    <span className="font-medium">de visitantes</span> (si hay disponibles). Para parqueadero{' '}
                    <span className="font-medium">común</span> necesita autorización especial. No puede usar parqueadero privado.
                  </>
                )}
              </div>
            </>
          )}
        </section>

        {/* ── Parqueadero ────────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Asignación de parqueadero</p>

          {/* Visitor common parking authorization (show before spot selector so it affects eligible list) */}
          {ownerType === 'VISITOR' && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <input
                id="commonAuth"
                type="checkbox"
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-amber-400 accent-amber-600"
                {...register('hasCommonParkingAuthorization')}
              />
              <label htmlFor="commonAuth" className="cursor-pointer text-sm text-amber-800">
                <span className="font-medium">El visitante tiene autorización especial</span> para usar parqueadero común.
              </label>
            </div>
          )}

          {/* Spot selector */}
          <FormField
            label="Parqueadero"
            htmlFor="parkingSpotId"
            hint="Opcional — solo se muestran los disponibles y elegibles"
          >
            <select
              id="parkingSpotId"
              className={[
                'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
                'transition-colors duration-150 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                spotEligibilityWarning
                  ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200'
                  : 'border-slate-300 focus:border-[#1e3a5f] focus:ring-[#dce8f5]',
              ].join(' ')}
              {...register('parkingSpotId')}
            >
              <option value="">Sin parqueadero asignado</option>
              {(['PRIVATE', 'COMMON', 'VISITOR'] as ParkingSpotType[]).map(type => {
                const spots = eligibleSpots.filter(s => s.type === type)
                if (spots.length === 0) return null
                return (
                  <optgroup key={type} label={`${PARKING_SPOT_TYPE_LABELS[type]}s`}>
                    {spots.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code}
                        {s.unitNumber ? ` (Apt. ${s.unitNumber})` : ''}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </FormField>

          {/* Eligibility warning */}
          {spotEligibilityWarning && (
            <p className="mt-1.5 text-xs text-amber-700">⚠️ {spotEligibilityWarning}</p>
          )}

          {/* Selected spot badge */}
          {selectedSpot && !spotEligibilityWarning && (
            <div className="mt-2 inline-flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SPOT_TYPE_BADGE[selectedSpot.type].bg} ${SPOT_TYPE_BADGE[selectedSpot.type].text}`}>
                {PARKING_SPOT_TYPE_LABELS[selectedSpot.type]}
              </span>
              <span className="text-xs text-slate-500">Código: {selectedSpot.code}</span>
            </div>
          )}

          {/* Authorization reference field (visitor in common spot) */}
          {showCommonAuthFields && hasCommonAuth && (
            <div className="mt-4">
              <FormField
                label="Referencia de autorización"
                required
                hint="Número de radicado, nombre del administrador o descripción"
                htmlFor="authRef"
              >
                <Input
                  id="authRef"
                  placeholder="Ej. AUT-2024-001 — aprobado por administración"
                  {...register('commonParkingAuthorizationRef')}
                />
              </FormField>
            </div>
          )}

          {/* Summary of available spots by type */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(['PRIVATE', 'COMMON', 'VISITOR'] as ParkingSpotType[]).map(type => {
              const available = allSpots.filter(s => s.type === type && !s.isOccupied).length
              const total = allSpots.filter(s => s.type === type).length
              return (
                <div key={type} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
                  <p className={`text-xs font-medium ${SPOT_TYPE_BADGE[type].text}`}>
                    {PARKING_SPOT_TYPE_LABELS[type]}
                  </p>
                  <p className="text-lg font-bold text-slate-800">{available}</p>
                  <p className="text-xs text-slate-400">de {total} libres</p>
                </div>
              )
            })}
          </div>
        </section>
      </form>
    </Modal>
  )
}
