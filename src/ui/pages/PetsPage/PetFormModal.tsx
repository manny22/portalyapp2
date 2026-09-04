import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import { APP_CONFIG } from '@/shared/config/app.config'
import type { Pet, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { classifyBreed, ALL_KNOWN_BREEDS } from '@/shared/constants/pet-breeds'
import { useResidents } from '@/shared/hooks/features/useResidents'

const TYPE_VALUES = ['DOG', 'CAT', 'BIRD', 'OTHER'] as const
const SIZE_VALUES = ['', 'SMALL', 'MEDIUM', 'LARGE'] as const

function rejectProhibitedBreed(val: { breed?: string }, ctx: z.RefinementCtx) {
  if (classifyBreed(val.breed) === 'PROHIBITED') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['breed'],
      message:
        'Esta raza está PROHIBIDA en Colombia según la Ley 746 de 2002 y no puede registrarse.',
    })
  }
}

const createSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(60),
    type: z.enum(TYPE_VALUES),
    breed: z.string().optional(),
    color: z.string().optional(),
    size: z.enum(SIZE_VALUES).optional(),
    weight: z
      .string()
      .optional()
      .refine(v => !v || (!isNaN(Number(v)) && Number(v) > 0), 'Debe ser mayor a 0'),
    vaccinationDate: z.string().optional(),
    vaccinationExpiry: z.string().optional(),
    healthCertificateNumber: z.string().optional(),
    healthCertificateExpiry: z.string().optional(),
    residentId: z.string().min(1, 'Seleccione un residente'),
  })
  .superRefine(rejectProhibitedBreed)

const editSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(60),
    type: z.enum(TYPE_VALUES),
    breed: z.string().optional(),
    color: z.string().optional(),
    size: z.enum(SIZE_VALUES).optional(),
    weight: z
      .string()
      .optional()
      .refine(v => !v || (!isNaN(Number(v)) && Number(v) > 0), 'Debe ser mayor a 0'),
    vaccinationDate: z.string().optional(),
    vaccinationExpiry: z.string().optional(),
    healthCertificateNumber: z.string().optional(),
    healthCertificateExpiry: z.string().optional(),
    residentId: z.string().optional(),
  })
  .superRefine(rejectProhibitedBreed)

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues | EditFormValues

interface PetFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreatePetDto | UpdatePetDto) => void
  loading?: boolean
  pet?: Pet | null
}

const TYPE_OPTIONS = [
  { value: 'DOG', label: 'Perro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'BIRD', label: 'Ave' },
  { value: 'OTHER', label: 'Otro' },
]

const SIZE_OPTIONS = [
  { value: '', label: 'No especificado' },
  { value: 'SMALL', label: 'Pequeño (< 10 kg)' },
  { value: 'MEDIUM', label: 'Mediano (10–25 kg)' },
  { value: 'LARGE', label: 'Grande (> 25 kg)' },
]

const CREATE_DEFAULTS: CreateFormValues = {
  name: '',
  type: 'DOG',
  breed: '',
  color: '',
  size: '',
  weight: '',
  vaccinationDate: '',
  vaccinationExpiry: '',
  healthCertificateNumber: '',
  healthCertificateExpiry: '',
  residentId: '',
}

function toInputDate(d: Date | null | undefined): string {
  if (!d) return ''
  return d instanceof Date ? d.toISOString().split('T')[0] : ''
}

function toDate(s: string | undefined): Date | undefined {
  return s ? new Date(s) : undefined
}

export function PetFormModal({ open, onClose, onSubmit, loading = false, pet }: PetFormModalProps) {
  const isEdit = Boolean(pet)
  const { data: residents = [] } = useResidents()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: CREATE_DEFAULTS,
  })

  useEffect(() => {
    if (open) {
      reset(
        pet
          ? {
              name: pet.name,
              type: (TYPE_VALUES as readonly string[]).includes(pet.type ?? '')
                ? (pet.type as CreateFormValues['type'])
                : 'OTHER',
              breed: pet.breed ?? '',
              color: pet.color ?? '',
              size: (pet.size ?? '') as CreateFormValues['size'],
              weight: pet.weight != null ? String(pet.weight) : '',
              vaccinationDate: toInputDate(pet.vaccinationDate),
              vaccinationExpiry: toInputDate(pet.vaccinationExpiry),
              healthCertificateNumber: pet.healthCertificateNumber ?? '',
              healthCertificateExpiry: toInputDate(pet.healthCertificateExpiry),
              residentId: pet.residentId,
            }
          : CREATE_DEFAULTS
      )
    }
  }, [open, pet, reset])

  const watchedType = watch('type')
  const watchedBreed = watch('breed')
  const breedClassification = classifyBreed(watchedBreed)

  const breedOptions = useMemo(() => {
    const breeds = ALL_KNOWN_BREEDS[watchedType] ?? []
    return [{ value: '', label: 'No especificada' }, ...breeds.map(b => ({ value: b, label: b }))]
  }, [watchedType])

  const residentOptions = useMemo(
    () => [
      { value: '', label: 'Seleccionar residente...' },
      ...residents
        .filter(r => r.isActive)
        .map(r => ({ value: r.id, label: `${r.firstName} ${r.lastName}` })),
    ],
    [residents]
  )

  function submit(values: FormValues) {
    const basePayload = {
      name: values.name,
      type: values.type,
      breed: values.breed || undefined,
      color: values.color || undefined,
      size: values.size || undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      vaccinationDate: toDate(values.vaccinationDate),
      vaccinationExpiry: toDate(values.vaccinationExpiry),
      healthCertificateNumber: values.healthCertificateNumber || undefined,
      healthCertificateExpiry: toDate(values.healthCertificateExpiry),
    }

    if (isEdit) {
      const dto: UpdatePetDto = basePayload
      onSubmit(dto)
    } else {
      const createValues = values as CreateFormValues
      const resident = residents.find(r => r.id === createValues.residentId)
      const dto: CreatePetDto = {
        ...basePayload,
        residentId: createValues.residentId,
        propertyId: resident?.propertyId ?? APP_CONFIG.DEFAULT_PROPERTY_ID,
      }
      onSubmit(dto)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar mascota' : 'Registrar mascota'}
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
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(submit)}>
        {breedClassification === 'PROHIBITED' && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">⛔ Raza prohibida — Ley 746 de 2002</p>
            <p className="mt-1">
              La importación, reproducción y tenencia de esta raza está prohibida en Colombia. No
              puede ser registrada.
            </p>
          </div>
        )}

        {breedClassification === 'SPECIAL_PERMIT' && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">⚠️ Raza potencialmente peligrosa — Ley 746 de 2002</p>
            <p className="mt-1">
              Esta raza requiere permiso especial municipal, seguro de responsabilidad civil, bozal
              en áreas comunes y correa en todo momento. El propietario debe portar estos documentos
              ante la administración.
            </p>
          </div>
        )}

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Información básica
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre de la mascota"
              required
              error={errors.name?.message}
              htmlFor="pet-name"
            >
              <Input
                id="pet-name"
                placeholder="Ej. Max"
                error={Boolean(errors.name)}
                {...register('name')}
              />
            </FormField>

            <FormField
              label="Residente propietario"
              required={!isEdit}
              error={errors.residentId?.message}
              htmlFor="resident"
            >
              <Select
                id="resident"
                options={residentOptions}
                disabled={isEdit}
                {...register('residentId')}
              />
            </FormField>

            <FormField
              label="Tipo de animal"
              required
              error={errors.type?.message}
              htmlFor="pet-type"
            >
              <Select id="pet-type" options={TYPE_OPTIONS} {...register('type')} />
            </FormField>

            <FormField label="Raza" error={errors.breed?.message} htmlFor="pet-breed">
              <Select
                id="pet-breed"
                options={breedOptions}
                error={Boolean(errors.breed)}
                {...register('breed')}
              />
            </FormField>

            <FormField label="Color / características físicas" htmlFor="pet-color">
              <Input
                id="pet-color"
                placeholder="Ej. Dorado con manchas blancas"
                {...register('color')}
              />
            </FormField>

            <FormField label="Tamaño" htmlFor="pet-size">
              <Select id="pet-size" options={SIZE_OPTIONS} {...register('size')} />
            </FormField>

            <FormField label="Peso (kg)" htmlFor="pet-weight" error={errors.weight?.message}>
              <Input
                id="pet-weight"
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Ej. 12.5"
                error={Boolean(errors.weight)}
                {...register('weight')}
              />
            </FormField>
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Salud y vacunación
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Fecha última vacunación" htmlFor="vac-date">
              <Input id="vac-date" type="date" {...register('vaccinationDate')} />
            </FormField>

            <FormField label="Próxima vacunación" htmlFor="vac-expiry">
              <Input id="vac-expiry" type="date" {...register('vaccinationExpiry')} />
            </FormField>

            <FormField label="N.° certificado sanitario" htmlFor="hc-number">
              <Input
                id="hc-number"
                placeholder="Ej. HC-2024-001"
                {...register('healthCertificateNumber')}
              />
            </FormField>

            <FormField label="Vencimiento certificado sanitario" htmlFor="hc-expiry">
              <Input id="hc-expiry" type="date" {...register('healthCertificateExpiry')} />
            </FormField>
          </div>
        </section>
      </form>
    </Modal>
  )
}
