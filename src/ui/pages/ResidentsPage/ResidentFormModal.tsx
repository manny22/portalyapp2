import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select, Spinner } from '@/ui/atoms'
import { APP_CONFIG } from '@/shared/config/app.config'
import { useResidentialUnits } from '@/shared/hooks/features/useResidentialUnits'
import type { Resident, CreateResidentDto, UpdateResidentDto } from '@/core/domain/models/resident.model'

const createSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  unitId: z.string().min(1, 'La unidad es requerida'),
  propertyId: z.string().min(1, 'La propiedad es requerida'),
})

const editSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  unitId: z.string().optional(),
  isActive: z.boolean().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues | EditFormValues

const CREATE_DEFAULTS: CreateFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  unitId: '',
  propertyId: APP_CONFIG.DEFAULT_PROPERTY_ID,
}

interface ResidentFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateResidentDto | UpdateResidentDto) => void
  loading?: boolean
  resident?: Resident | null
}

export function ResidentFormModal({ open, onClose, onSubmit, loading = false, resident }: ResidentFormModalProps) {
  const isEdit = Boolean(resident)
  const { units, isLoading: unitsLoading } = useResidentialUnits(APP_CONFIG.DEFAULT_PROPERTY_ID)

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
      reset(isEdit ? CREATE_DEFAULTS : CREATE_DEFAULTS)
    }
  }, [open, reset, isEdit])

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateResidentDto = {
        firstName: (values as EditFormValues).firstName,
        lastName: (values as EditFormValues).lastName,
        email: (values as EditFormValues).email,
        phone: (values as EditFormValues).phone,
        unitId: (values as EditFormValues).unitId,
        isActive: (values as EditFormValues).isActive,
      }
      onSubmit(dto)
    } else {
      const dto: CreateResidentDto = {
        firstName: (values as CreateFormValues).firstName,
        lastName: (values as CreateFormValues).lastName,
        email: (values as CreateFormValues).email,
        phone: (values as CreateFormValues).phone || undefined,
        unitId: (values as CreateFormValues).unitId,
        propertyId: (values as CreateFormValues).propertyId,
      }
      onSubmit(dto)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar residente' : 'Registrar residente'}
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Datos Personales</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombre" required={!isEdit} error={errors.firstName?.message} htmlFor="firstName">
              <Input
                id="firstName"
                placeholder="Juan"
                error={Boolean(errors.firstName)}
                {...register('firstName')}
              />
            </FormField>

            <FormField label="Apellido" required={!isEdit} error={errors.lastName?.message} htmlFor="lastName">
              <Input
                id="lastName"
                placeholder="Pérez"
                error={Boolean(errors.lastName)}
                {...register('lastName')}
              />
            </FormField>

            <FormField label="Email" required={!isEdit} error={errors.email?.message} htmlFor="email">
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <FormField label="Teléfono" error={errors.phone?.message} htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                placeholder="310 123 4567"
                error={Boolean(errors.phone)}
                {...register('phone')}
              />
            </FormField>

            <FormField label="Unidad" required={!isEdit} error={errors.unitId?.message} htmlFor="unitId">
              {unitsLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Spinner size="sm" />
                </div>
              ) : (
                <Select
                  id="unitId"
                  placeholder="Seleccione unidad"
                  options={
                    Array.isArray(units)
                      ? units.map(u => ({
                          value: u.id,
                          label: `${u.number} - Piso ${u.floor || 'N/A'}`,
                        }))
                      : []
                  }
                  error={Boolean(errors.unitId)}
                  {...register('unitId')}
                />
              )}
            </FormField>
          </div>
        </section>
      </form>
    </Modal>
  )
}
