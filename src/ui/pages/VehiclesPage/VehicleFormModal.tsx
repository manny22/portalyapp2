import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import { APP_CONFIG } from '@/shared/config/app.config'
import { useResidents } from '@/shared/hooks/features/useResidents'
import type {
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleType,
} from '@/core/domain/models/vehicle.model'

const createSchema = z.object({
  plate: z
    .string()
    .min(1, 'La placa es requerida')
    .min(4, 'La placa debe tener al menos 4 caracteres'),
  type: z.enum(['CAR', 'MOTORCYCLE', 'BICYCLE', 'TRUCK', 'OTHER'] as const),
  brand: z.string().min(1, 'La marca es requerida').max(50),
  model: z.string().min(1, 'El modelo es requerido').max(50),
  color: z.string().min(1, 'El color es requerido').max(50),
  residentId: z.string().min(1, 'El residente es requerido'),
  propertyId: z.string().min(1, 'La propiedad es requerida'),
})

const editSchema = z.object({
  plate: z.string().optional(),
  type: z.enum(['CAR', 'MOTORCYCLE', 'BICYCLE', 'TRUCK', 'OTHER'] as const).optional(),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  residentId: z.string().optional(),
  isActive: z.boolean().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues | EditFormValues

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: 'CAR', label: 'Automóvil' },
  { value: 'MOTORCYCLE', label: 'Motocicleta' },
  { value: 'BICYCLE', label: 'Bicicleta' },
  { value: 'TRUCK', label: 'Camión' },
  { value: 'OTHER', label: 'Otro' },
]

const CREATE_DEFAULTS: CreateFormValues = {
  plate: '',
  type: 'CAR',
  brand: '',
  model: '',
  color: '',
  residentId: '',
  propertyId: APP_CONFIG.DEFAULT_PROPERTY_ID,
}

interface VehicleFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateVehicleDto | UpdateVehicleDto) => void
  loading?: boolean
  vehicle?: Vehicle | null
}

export function VehicleFormModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  vehicle,
}: VehicleFormModalProps) {
  const isEdit = Boolean(vehicle)
  const { data: residents = [] } = useResidents()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: CREATE_DEFAULTS,
  })

  useEffect(() => {
    if (open) {
      reset(
        vehicle
          ? {
              plate: vehicle.plate,
              type: vehicle.type,
              brand: vehicle.brand,
              model: vehicle.model,
              color: vehicle.color,
              residentId: vehicle.residentId,
              isActive: vehicle.isActive,
            }
          : CREATE_DEFAULTS
      )
    }
  }, [open, vehicle, reset])

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateVehicleDto = {
        plate: (values as EditFormValues).plate,
        type: (values as EditFormValues).type,
        brand: (values as EditFormValues).brand,
        model: (values as EditFormValues).model,
        color: (values as EditFormValues).color,
      }
      onSubmit(dto)
    } else {
      const dto: CreateVehicleDto = {
        plate: (values as CreateFormValues).plate,
        type: (values as CreateFormValues).type,
        brand: (values as CreateFormValues).brand,
        model: (values as CreateFormValues).model,
        color: (values as CreateFormValues).color,
        residentId: (values as CreateFormValues).residentId,
        propertyId: (values as CreateFormValues).propertyId,
      }
      onSubmit(dto)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar vehículo' : 'Registrar vehículo'}
      size="md"
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
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Identificación
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Placa" required error={errors.plate?.message} htmlFor="plate">
              <Input
                id="plate"
                placeholder="Ej. ABC123"
                error={Boolean(errors.plate)}
                {...register('plate')}
              />
            </FormField>

            <FormField label="Tipo" required error={errors.type?.message} htmlFor="type">
              <Select
                id="type"
                placeholder="Seleccione tipo"
                options={VEHICLE_TYPE_OPTIONS}
                error={Boolean(errors.type)}
                {...register('type')}
              />
            </FormField>

            <FormField label="Marca" required error={errors.brand?.message} htmlFor="brand">
              <Input
                id="brand"
                placeholder="Ej. Toyota"
                error={Boolean(errors.brand)}
                {...register('brand')}
              />
            </FormField>

            <FormField label="Modelo" required error={errors.model?.message} htmlFor="model">
              <Input
                id="model"
                placeholder="Ej. Corolla"
                error={Boolean(errors.model)}
                {...register('model')}
              />
            </FormField>

            <FormField label="Color" required error={errors.color?.message} htmlFor="color">
              <Input
                id="color"
                placeholder="Ej. Blanco"
                error={Boolean(errors.color)}
                {...register('color')}
              />
            </FormField>

            <FormField
              label="Residente"
              required
              error={errors.residentId?.message}
              htmlFor="residentId"
            >
              <Select
                id="residentId"
                placeholder="Seleccione residente"
                options={residents.map(r => ({
                  value: r.id,
                  label: `${r.firstName} ${r.lastName}`,
                }))}
                error={Boolean(errors.residentId)}
                {...register('residentId')}
              />
            </FormField>
          </div>
        </section>
      </form>
    </Modal>
  )
}
