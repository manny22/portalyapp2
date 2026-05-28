import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import type { Visitor, CreateVisitorDto, UpdateVisitorDto } from '@/core/domain/models/visitor.model'
import type { DocumentType } from '@/core/domain/value-objects/document-number.vo'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { DocumentNumber } from '@/core/domain/value-objects/document-number.vo'
import { PhoneNumber } from '@/core/domain/value-objects/phone-number.vo'

// ── Schemas ────────────────────────────────────────────────────────────────────
// Each field delegates its validation to the corresponding Value Object.
// The VO is the single source of truth for its rules (S of SOLID).

const createSchema = z
  .object({
    firstName: z.string().superRefine((val, ctx) => {
      const err = FullName.validateFirstName(val)
      if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
    }),
    lastName: z.string().superRefine((val, ctx) => {
      const err = FullName.validateLastName(val)
      if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err })
    }),
    documentType: z.enum(['CC', 'CE', 'TI', 'PASSPORT', 'NIT'] as const, {
      errorMap: () => ({ message: 'Seleccione un tipo de documento' }),
    }),
    documentNumber: z.string(),
    phone: z.string().optional(),
    company: z
      .string()
      .max(100, 'La empresa no puede exceder 100 caracteres')
      .optional(),
    observations: z.string().max(300, 'Las observaciones no pueden exceder 300 caracteres').optional(),
  })
  .superRefine((val, ctx) => {
    const docErr = DocumentNumber.validate(val.documentType as DocumentType, val.documentNumber)
    if (docErr) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documentNumber'], message: docErr })

    const phoneErr = PhoneNumber.validateOptional(val.phone)
    if (phoneErr) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: phoneErr })
  })

// Edit: name and document are immutable once a visitor is registered
const editSchema = z
  .object({
    phone: z.string().optional(),
    company: z
      .string()
      .max(100, 'La empresa no puede exceder 100 caracteres')
      .optional(),
    observations: z.string().max(300, 'Las observaciones no pueden exceder 300 caracteres').optional(),
  })
  .superRefine((val, ctx) => {
    const phoneErr = PhoneNumber.validateOptional(val.phone)
    if (phoneErr) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: phoneErr })
  })

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>
type FormValues = CreateFormValues

// ── Static options ─────────────────────────────────────────────────────────────

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
]

const CREATE_DEFAULTS: FormValues = {
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  phone: '',
  company: '',
  observations: '',
}

// ── Component ──────────────────────────────────────────────────────────────────

interface VisitorFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateVisitorDto | UpdateVisitorDto) => void
  loading?: boolean
  visitor?: Visitor | null
}

export function VisitorFormModal({ open, onClose, onSubmit, loading = false, visitor }: VisitorFormModalProps) {
  const isEdit = Boolean(visitor)

  // Use a unified form shape; edit fields are a subset
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? (editSchema as unknown as typeof createSchema) : createSchema),
    defaultValues: CREATE_DEFAULTS,
  })

  useEffect(() => {
    if (open) {
      reset(
        visitor
          ? {
              firstName: visitor.name.firstName,
              lastName: visitor.name.lastName,
              documentType: visitor.document.type,
              documentNumber: visitor.document.number,
              phone: visitor.phone?.value ?? '',
              company: visitor.company ?? '',
              observations: visitor.observations ?? '',
            }
          : CREATE_DEFAULTS,
      )
    }
  }, [open, visitor, reset])

  const watchedDocType = watch('documentType') as DocumentType

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateVisitorDto = {
        phone: values.phone || undefined,
        company: values.company || undefined,
        observations: values.observations || undefined,
      }
      onSubmit(dto)
    } else {
      const dto: CreateVisitorDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        phone: values.phone || undefined,
        company: values.company || undefined,
        observations: values.observations || undefined,
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

        {/* ── Identidad ─────────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Identidad</p>

          {isEdit ? (
            /* En edición, nombre y documento son de solo lectura */
            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-800">{visitor!.name.full}</p>
              <p className="text-xs text-slate-500 mt-0.5">{visitor!.document.format()}</p>
              <p className="text-xs text-slate-400 mt-1 italic">
                El nombre y documento no pueden modificarse una vez registrados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Nombre(s)" required error={errors.firstName?.message} htmlFor="firstName">
                <Input
                  id="firstName"
                  placeholder="Ej. Pedro Antonio"
                  error={Boolean(errors.firstName)}
                  {...register('firstName')}
                />
              </FormField>

              <FormField label="Apellido(s)" required error={errors.lastName?.message} htmlFor="lastName">
                <Input
                  id="lastName"
                  placeholder="Ej. Suárez Gómez"
                  error={Boolean(errors.lastName)}
                  {...register('lastName')}
                />
              </FormField>

              <FormField label="Tipo de documento" required error={errors.documentType?.message} htmlFor="docType">
                <Select
                  id="docType"
                  options={DOCUMENT_TYPE_OPTIONS}
                  error={Boolean(errors.documentType)}
                  {...register('documentType')}
                />
              </FormField>

              <FormField
                label="Número de documento"
                required
                error={errors.documentNumber?.message}
                hint={DocumentNumber.hint(watchedDocType)}
                htmlFor="docNumber"
              >
                <Input
                  id="docNumber"
                  placeholder={DocumentNumber.hint(watchedDocType)}
                  error={Boolean(errors.documentNumber)}
                  {...register('documentNumber')}
                />
              </FormField>
            </div>
          )}
        </section>

        {/* ── Contacto y procedencia ────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Contacto y procedencia
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Teléfono / Celular"
              error={errors.phone?.message}
              hint={PhoneNumber.hint()}
              htmlFor="phone"
            >
              <Input
                id="phone"
                type="tel"
                placeholder="3101234567"
                error={Boolean(errors.phone)}
                {...register('phone')}
              />
            </FormField>

            <FormField
              label="Empresa / Organización"
              error={errors.company?.message}
              hint="Opcional — si viene en representación de una empresa"
              htmlFor="company"
            >
              <Input
                id="company"
                placeholder="Ej. Empresas Acme"
                error={Boolean(errors.company)}
                {...register('company')}
              />
            </FormField>
          </div>
        </section>

        {/* ── Observaciones ─────────────────────────────────────────────────── */}
        <FormField
          label="Observaciones"
          hint="Opcional — motivo de la visita, acceso especial, etc."
          error={errors.observations?.message}
          htmlFor="observations"
        >
          <textarea
            id="observations"
            rows={3}
            placeholder="Ej. Técnico de mantenimiento, visitará el apartamento 201..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#dce8f5]"
            {...register('observations')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
