import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import type { Pet, PetType, PetSize, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { classifyBreed, ALL_KNOWN_BREEDS, SPECIAL_PERMIT_BREEDS, PROHIBITED_BREEDS } from '@/shared/constants/pet-breeds'
import { useResidents } from '@/shared/hooks/features/useResidents'

const schema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(60),
    type: z.enum(['DOG', 'CAT', 'BIRD', 'OTHER'] as const),
    breed: z.string().optional(),
    color: z.string().optional(),
    size: z.enum(['SMALL', 'MEDIUM', 'LARGE', ''] as const).optional(),
    weight: z.coerce.number().positive('Debe ser mayor a 0').optional().or(z.literal('')),
    observations: z.string().optional(),
    residentId: z.string().min(1, 'Seleccione un residente'),
    vaccinationDate: z.string().optional(),
    vaccinationExpiry: z.string().optional(),
    healthCertificateNumber: z.string().optional(),
    healthCertificateExpiry: z.string().optional(),
    insurancePolicyNumber: z.string().optional(),
    insuranceExpiry: z.string().optional(),
    municipalRegistrationNumber: z.string().optional(),
    municipalRegistrationExpiry: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (classifyBreed(val.breed) === 'PROHIBITED') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['breed'],
        message: `Esta raza está PROHIBIDA en Colombia según la Ley 746 de 2002 y no puede registrarse.`,
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface PetFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreatePetDto | UpdatePetDto, residentId: string) => void
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
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'DOG',
      breed: '',
      color: '',
      size: '',
      weight: '',
      observations: '',
      residentId: '',
      vaccinationDate: '',
      vaccinationExpiry: '',
      healthCertificateNumber: '',
      healthCertificateExpiry: '',
      insurancePolicyNumber: '',
      insuranceExpiry: '',
      municipalRegistrationNumber: '',
      municipalRegistrationExpiry: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        pet
          ? {
              name: pet.name,
              type: pet.type,
              breed: pet.breed ?? '',
              color: pet.color ?? '',
              size: (pet.size ?? '') as PetSize | '',
              weight: pet.weight ?? ('' as unknown as number),
              observations: pet.observations ?? '',
              residentId: pet.residentId,
              vaccinationDate: toInputDate(pet.vaccinationDate),
              vaccinationExpiry: toInputDate(pet.vaccinationExpiry),
              healthCertificateNumber: pet.healthCertificateNumber ?? '',
              healthCertificateExpiry: toInputDate(pet.healthCertificateExpiry),
              insurancePolicyNumber: pet.insurancePolicyNumber ?? '',
              insuranceExpiry: toInputDate(pet.insuranceExpiry),
              municipalRegistrationNumber: pet.municipalRegistrationNumber ?? '',
              municipalRegistrationExpiry: toInputDate(pet.municipalRegistrationExpiry),
            }
          : {
              name: '',
              type: 'DOG',
              breed: '',
              color: '',
              size: '',
              weight: '',
              observations: '',
              residentId: '',
              vaccinationDate: '',
              vaccinationExpiry: '',
              healthCertificateNumber: '',
              healthCertificateExpiry: '',
              insurancePolicyNumber: '',
              insuranceExpiry: '',
              municipalRegistrationNumber: '',
              municipalRegistrationExpiry: '',
            },
      )
    }
  }, [open, pet, reset])

  const watchedType = watch('type') as PetType
  const watchedBreed = watch('breed')
  const breedClassification = classifyBreed(watchedBreed)
  const isDangerous = breedClassification === 'SPECIAL_PERMIT' || breedClassification === 'PROHIBITED'

  const breedOptions = useMemo(() => {
    const breeds = ALL_KNOWN_BREEDS[watchedType] ?? []
    return [
      { value: '', label: 'No especificada' },
      ...breeds.map(b => ({ value: b, label: b })),
    ]
  }, [watchedType])

  const residentOptions = useMemo(
    () => [
      { value: '', label: 'Seleccionar residente...' },
      ...residents
        .filter(r => r.isActive)
        .map(r => ({ value: r.id, label: `${r.name.full} — Apt. ${r.unitNumber}` })),
    ],
    [residents],
  )

  function submit(values: FormValues) {
    const resident = residents.find(r => r.id === values.residentId)
    const payload = {
      name: values.name,
      type: values.type as PetType,
      breed: values.breed || undefined,
      color: values.color || undefined,
      size: (values.size as PetSize) || undefined,
      weight: values.weight ? Number(values.weight) : undefined,
      observations: values.observations || undefined,
      residentId: values.residentId,
      unitId: resident?.unitId ?? '',
      propertyId: resident?.propertyId ?? 'prop-1',
      vaccinationDate: toDate(values.vaccinationDate),
      vaccinationExpiry: toDate(values.vaccinationExpiry),
      healthCertificateNumber: values.healthCertificateNumber || undefined,
      healthCertificateExpiry: toDate(values.healthCertificateExpiry),
      insurancePolicyNumber: values.insurancePolicyNumber || undefined,
      insuranceExpiry: toDate(values.insuranceExpiry),
      municipalRegistrationNumber: values.municipalRegistrationNumber || undefined,
      municipalRegistrationExpiry: toDate(values.municipalRegistrationExpiry),
    }
    onSubmit(payload, values.residentId)
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

        {/* Alerta raza prohibida */}
        {breedClassification === 'PROHIBITED' && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">⛔ Raza prohibida — Ley 746 de 2002</p>
            <p className="mt-1">
              La importación, reproducción y tenencia de esta raza está prohibida en Colombia. No puede ser registrada.
            </p>
          </div>
        )}

        {/* Alerta raza peligrosa */}
        {breedClassification === 'SPECIAL_PERMIT' && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">⚠️ Raza potencialmente peligrosa — Ley 746 de 2002</p>
            <p className="mt-1">
              Esta raza requiere: permiso especial municipal, seguro de responsabilidad civil, bozal en áreas comunes y
              correa en todo momento. Complete los campos obligatorios a continuación.
            </p>
          </div>
        )}

        {/* Sección: Información básica */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Información básica</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombre de la mascota" required error={errors.name?.message} htmlFor="pet-name">
              <Input id="pet-name" placeholder="Ej. Max" {...register('name')} error={Boolean(errors.name)} />
            </FormField>

            <FormField label="Residente propietario" required error={errors.residentId?.message} htmlFor="resident">
              <Select
                id="resident"
                options={residentOptions}
                error={Boolean(errors.residentId)}
                disabled={isEdit}
                {...register('residentId')}
              />
            </FormField>

            <FormField label="Tipo de animal" required error={errors.type?.message} htmlFor="pet-type">
              <Select id="pet-type" options={TYPE_OPTIONS} {...register('type')} />
            </FormField>

            <FormField label="Raza" error={errors.breed?.message} htmlFor="pet-breed">
              <Select id="pet-breed" options={breedOptions} error={Boolean(errors.breed)} {...register('breed')} />
            </FormField>

            <FormField label="Color / características físicas" htmlFor="pet-color">
              <Input id="pet-color" placeholder="Ej. Dorado con manchas blancas" {...register('color')} />
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
                {...register('weight')}
                error={Boolean(errors.weight)}
              />
            </FormField>
          </div>
        </section>

        {/* Sección: Salud y vacunación (Ley 746 art. 5) */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Salud y vacunación — Ley 746 / 2002
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Fecha última vacunación" htmlFor="vac-date">
              <Input id="vac-date" type="date" {...register('vaccinationDate')} />
            </FormField>

            <FormField label="Próxima vacunación" htmlFor="vac-expiry">
              <Input id="vac-expiry" type="date" {...register('vaccinationExpiry')} />
            </FormField>

            <FormField label="N.° certificado sanitario" htmlFor="hc-number">
              <Input id="hc-number" placeholder="Ej. HC-2024-001" {...register('healthCertificateNumber')} />
            </FormField>

            <FormField label="Vencimiento certificado sanitario" htmlFor="hc-expiry">
              <Input id="hc-expiry" type="date" {...register('healthCertificateExpiry')} />
            </FormField>
          </div>
        </section>

        {/* Sección: Razas peligrosas — solo si aplica */}
        {isDangerous && (
          <section>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
              Requisitos especiales — Ley 746 / 2002 (razas peligrosas)
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Obligatorio para razas clasificadas como potencialmente peligrosas: seguro de responsabilidad civil y
              registro municipal. El propietario debe portar estos documentos en todo momento.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                label="N.° póliza de seguro"
                required
                htmlFor="insurance-number"
                hint="Responsabilidad civil frente a daños a terceros"
              >
                <Input id="insurance-number" placeholder="Ej. SEG-2024-789" {...register('insurancePolicyNumber')} />
              </FormField>

              <FormField label="Vencimiento póliza" required htmlFor="insurance-expiry">
                <Input id="insurance-expiry" type="date" {...register('insuranceExpiry')} />
              </FormField>

              <FormField label="N.° registro municipal" required htmlFor="mun-reg">
                <Input id="mun-reg" placeholder="Ej. REG-MUN-2024-045" {...register('municipalRegistrationNumber')} />
              </FormField>

              <FormField label="Vencimiento registro municipal" required htmlFor="mun-expiry">
                <Input id="mun-expiry" type="date" {...register('municipalRegistrationExpiry')} />
              </FormField>
            </div>
          </section>
        )}

        {/* Observaciones */}
        <FormField label="Observaciones" htmlFor="pet-obs">
          <textarea
            id="pet-obs"
            rows={3}
            placeholder="Comportamiento, alergias, condiciones especiales..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#dce8f5]"
            {...register('observations')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
