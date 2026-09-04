import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import type {
  Visitor,
  CreateVisitorDto,
  UpdateVisitorDto,
  DocumentType,
} from '@/core/domain/models/visitor.model'

const createSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  documentType: z.enum(['CC', 'CE', 'PASSPORT', 'NIT', 'TI'] as const),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  phone: z.string().optional(),
})

const editSchema = z.object({
  phone: z.string().optional(),
  documentType: z.enum(['CC', 'CE', 'PASSPORT', 'NIT', 'TI'] as const),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues | EditFormValues

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CC' as DocumentType, label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE' as DocumentType, label: 'Cédula de Extranjería (CE)' },
  { value: 'TI' as DocumentType, label: 'Tarjeta de Identidad (TI)' },
  { value: 'PASSPORT' as DocumentType, label: 'Pasaporte' },
  { value: 'NIT' as DocumentType, label: 'NIT' },
]

const CREATE_DEFAULTS: CreateFormValues = {
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  phone: '',
}

interface VisitorFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<CreateVisitorDto, 'propertyId'> | UpdateVisitorDto) => void
  loading?: boolean
  visitor?: Visitor | null
}

export function VisitorFormModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  visitor,
}: VisitorFormModalProps) {
  const isEdit = Boolean(visitor)

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
        visitor
          ? {
              firstName: visitor.firstName,
              lastName: visitor.lastName,
              documentType: visitor.documentType,
              documentNumber: visitor.documentNumber,
              phone: visitor.phone ?? '',
            }
          : CREATE_DEFAULTS
      )
    }
  }, [open, visitor, reset])

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateVisitorDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        phone: values.phone || undefined,
      }
      onSubmit(dto)
    } else {
      const dto: Omit<CreateVisitorDto, 'propertyId'> = {
        firstName: (values as CreateFormValues).firstName,
        lastName: (values as CreateFormValues).lastName,
        documentType: (values as CreateFormValues).documentType,
        documentNumber: (values as CreateFormValues).documentNumber,
        phone: (values as CreateFormValues).phone || undefined,
      }
      onSubmit(dto)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar visitante' : 'Registrar visitante'}
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
            Identidad
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre(s)"
              required
              error={errors.firstName?.message}
              htmlFor="firstName"
            >
              <Input
                id="firstName"
                placeholder="Ej. Pedro Antonio"
                error={Boolean(errors.firstName)}
                {...register('firstName')}
              />
            </FormField>

            <FormField
              label="Apellido(s)"
              required
              error={errors.lastName?.message}
              htmlFor="lastName"
            >
              <Input
                id="lastName"
                placeholder="Ej. Suárez Gómez"
                error={Boolean(errors.lastName)}
                {...register('lastName')}
              />
            </FormField>

            <FormField
              label="Tipo de documento"
              required
              error={errors.documentType?.message}
              htmlFor="documentType"
            >
              <Select
                id="documentType"
                placeholder="Seleccione tipo"
                options={DOCUMENT_TYPE_OPTIONS}
                error={Boolean(errors.documentType)}
                {...register('documentType')}
              />
            </FormField>

            <FormField
              label="Número de documento"
              required
              error={errors.documentNumber?.message}
              htmlFor="documentNumber"
            >
              <Input
                id="documentNumber"
                placeholder="Ej. 79854321"
                error={Boolean(errors.documentNumber)}
                {...register('documentNumber')}
              />
            </FormField>
          </div>
        </section>

        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Contacto
          </p>

          <FormField label="Teléfono" error={errors.phone?.message} htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              placeholder="Ej. 310 123 4567"
              error={Boolean(errors.phone)}
              {...register('phone')}
            />
          </FormField>
        </section>
      </form>
    </Modal>
  )
}
