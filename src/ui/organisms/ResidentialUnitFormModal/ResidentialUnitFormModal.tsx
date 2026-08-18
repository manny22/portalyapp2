import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import { APP_CONFIG } from '@/shared/config/app.config'
import { useResidentialBlocks } from '@/shared/hooks/features/useResidentialBlocks'
import type { ResidentialUnit, CreateResidentialUnitDto, UpdateResidentialUnitDto } from '@/core/domain/models/residential-unit.model'

const createSchema = z.object({
  number: z.string().min(1, 'El número es requerido'),
  floor: z.number().min(0, 'El piso debe ser un número válido'),
  blockId: z.string().min(1, 'El bloque es requerido'),
  propertyId: z.string().min(1, 'La propiedad es requerida'),
})

const editSchema = z.object({
  number: z.string().optional(),
  floor: z.number().optional(),
  blockId: z.string().optional(),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues | EditFormValues

const CREATE_DEFAULTS: CreateFormValues = {
  number: '',
  floor: 0,
  blockId: '',
  propertyId: APP_CONFIG.DEFAULT_PROPERTY_ID,
}

interface ResidentialUnitFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateResidentialUnitDto | UpdateResidentialUnitDto) => void
  loading?: boolean
  unit?: ResidentialUnit | null
}

export function ResidentialUnitFormModal({ open, onClose, onSubmit, loading = false, unit }: ResidentialUnitFormModalProps) {
  const isEdit = Boolean(unit)
  const { blocks } = useResidentialBlocks(APP_CONFIG.DEFAULT_PROPERTY_ID)

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
      reset(isEdit && unit ? {
        number: unit.number,
        floor: unit.floor ?? 0,
        blockId: unit.blockId ?? '',
      } : CREATE_DEFAULTS)
    }
  }, [open, unit, reset, isEdit])

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateResidentialUnitDto = {
        number: (values as EditFormValues).number,
        floor: (values as EditFormValues).floor,
        blockId: (values as EditFormValues).blockId,
      }
      onSubmit(dto)
    } else {
      const dto: CreateResidentialUnitDto = {
        number: (values as CreateFormValues).number,
        floor: (values as CreateFormValues).floor,
        blockId: (values as CreateFormValues).blockId,
        propertyId: (values as CreateFormValues).propertyId,
      }
      onSubmit(dto)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar residencia' : 'Crear residencia'}
      size="md"
      footer={
        <ModalFooter
          onCancel={onClose}
          onConfirm={handleSubmit(submit)}
          confirmLabel={isEdit ? 'Guardar cambios' : 'Crear'}
          loading={loading}
        />
      }
    >
      <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Información General</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Número" required={!isEdit} error={errors.number?.message} htmlFor="number">
              <Input
                id="number"
                placeholder="301"
                error={Boolean(errors.number)}
                {...register('number')}
              />
            </FormField>

            <FormField label="Piso" required={!isEdit} error={errors.floor?.message} htmlFor="floor">
              <Input
                id="floor"
                type="number"
                placeholder="3"
                error={Boolean(errors.floor)}
                {...register('floor', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Bloque" required={!isEdit} error={errors.blockId?.message} htmlFor="blockId">
              <Select
                id="blockId"
                placeholder="Seleccione bloque"
                options={Array.isArray(blocks) ? blocks.map(b => ({ value: b.id, label: b.name })) : []}
                error={Boolean(errors.blockId)}
                {...register('blockId')}
              />
            </FormField>

            {!isEdit && (
              <FormField label="Propiedad" required error={errors.propertyId?.message} htmlFor="propertyId">
                <Input
                  id="propertyId"
                  placeholder={APP_CONFIG.DEFAULT_PROPERTY_ID}
                  value={APP_CONFIG.DEFAULT_PROPERTY_ID}
                  disabled
                  {...register('propertyId')}
                />
              </FormField>
            )}
          </div>
        </section>
      </form>
    </Modal>
  )
}
