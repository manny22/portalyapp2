import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal, ModalFooter, FormField } from '@/ui/molecules'
import { Input, Select } from '@/ui/atoms'
import type { Resident, CreateResidentDto, UpdateResidentDto, ResidentRelationType } from '@/core/domain/models/resident.model'
import type { DocumentType } from '@/core/domain/value-objects/document-number.vo'
import { FullName } from '@/core/domain/value-objects/full-name.vo'
import { DocumentNumber } from '@/core/domain/value-objects/document-number.vo'
import { Email } from '@/core/domain/value-objects/email.vo'
import { PhoneNumber } from '@/core/domain/value-objects/phone-number.vo'
import { MOCK_UNITS } from '@/infrastructure/adapters/data/properties.data'

// ── Zod schema: each field delegates validation to its Value Object ────────────
// This enforces the S of SOLID — the VO owns the rule, the schema just calls it.

const schema = z
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
    email: z.string().optional(),
    phone: z.string().optional(),
    relation: z.enum(['OWNER', 'TENANT', 'FAMILY', 'AUTHORIZED'] as const, {
      errorMap: () => ({ message: 'Seleccione el tipo de vinculación' }),
    }),
    unitId: z.string().min(1, 'Seleccione una unidad residencial'),
    observations: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    // Document: VO validates per type
    const docErr = DocumentNumber.validate(val.documentType as DocumentType, val.documentNumber)
    if (docErr) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documentNumber'], message: docErr })

    // Email: optional but must be valid if present
    const emailErr = Email.validateOptional(val.email)
    if (emailErr) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: emailErr })

    // Phone: optional but must be valid if present
    const phoneErr = PhoneNumber.validateOptional(val.phone)
    if (phoneErr) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: phoneErr })
  })

type FormValues = z.infer<typeof schema>

// ── Static options ─────────────────────────────────────────────────────────────

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
]

const RELATION_OPTIONS: { value: ResidentRelationType; label: string; description: string }[] = [
  { value: 'OWNER', label: 'Propietario', description: 'Dueño de la unidad' },
  { value: 'TENANT', label: 'Arrendatario', description: 'Inquilino con contrato de arrendamiento' },
  { value: 'FAMILY', label: 'Familiar', description: 'Familiar del propietario o arrendatario' },
  { value: 'AUTHORIZED', label: 'Autorizado', description: 'Persona autorizada por el propietario' },
]

// ── Component ──────────────────────────────────────────────────────────────────

interface ResidentFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateResidentDto | UpdateResidentDto) => void
  loading?: boolean
  resident?: Resident | null
}

const DEFAULT_VALUES: FormValues = {
  firstName: '',
  lastName: '',
  documentType: 'CC',
  documentNumber: '',
  email: '',
  phone: '',
  relation: 'OWNER',
  unitId: '',
  observations: '',
}

export function ResidentFormModal({ open, onClose, onSubmit, loading = false, resident }: ResidentFormModalProps) {
  const isEdit = Boolean(resident)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  // Reset form on open
  useEffect(() => {
    if (open) {
      reset(
        resident
          ? {
              firstName: resident.name.firstName,
              lastName: resident.name.lastName,
              documentType: resident.document.type,
              documentNumber: resident.document.number,
              email: resident.email?.value ?? '',
              phone: resident.phone?.value ?? '',
              relation: resident.relation,
              unitId: resident.unitId,
              observations: resident.observations ?? '',
            }
          : DEFAULT_VALUES,
      )
    }
  }, [open, resident, reset])

  const watchedDocType = watch('documentType') as DocumentType

  // Unit options grouped by block
  const unitOptionsByBlock = useMemo(() => {
    const groups: Record<string, { id: string; label: string }[]> = {}
    for (const unit of MOCK_UNITS) {
      const block = unit.blockName ?? 'Sin bloque'
      if (!groups[block]) groups[block] = []
      groups[block].push({ id: unit.id, label: `Apt. ${unit.number}` })
    }
    return groups
  }, [])

  function submit(values: FormValues) {
    if (isEdit) {
      const dto: UpdateResidentDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        relation: values.relation,
        unitId: values.unitId,
        observations: values.observations || undefined,
      }
      onSubmit(dto)
    } else {
      const dto: CreateResidentDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        documentType: values.documentType,
        documentNumber: values.documentNumber,
        email: values.email || undefined,
        phone: values.phone || undefined,
        relation: values.relation,
        unitId: values.unitId,
        propertyId: 'prop-1',
        observations: values.observations || undefined,
      }
      onSubmit(dto)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar residente' : 'Registrar residente'}
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

        {/* ── Identidad ─────────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Identidad</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nombre(s)" required error={errors.firstName?.message} htmlFor="firstName">
              <Input
                id="firstName"
                placeholder="Ej. Carlos Andrés"
                error={Boolean(errors.firstName)}
                {...register('firstName')}
              />
            </FormField>

            <FormField label="Apellido(s)" required error={errors.lastName?.message} htmlFor="lastName">
              <Input
                id="lastName"
                placeholder="Ej. Ramírez Torres"
                error={Boolean(errors.lastName)}
                {...register('lastName')}
              />
            </FormField>

            <FormField label="Tipo de documento" required error={errors.documentType?.message} htmlFor="docType">
              <Select
                id="docType"
                options={DOCUMENT_TYPE_OPTIONS}
                disabled={isEdit}
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
                disabled={isEdit}
                error={Boolean(errors.documentNumber)}
                {...register('documentNumber')}
              />
            </FormField>
          </div>
        </section>

        {/* ── Contacto ──────────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contacto</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Correo electrónico"
              error={errors.email?.message}
              hint="Opcional"
              htmlFor="email"
            >
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

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
          </div>
        </section>

        {/* ── Vivienda ──────────────────────────────────────────────────────── */}
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Vivienda y vinculación</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Unidad residencial" required error={errors.unitId?.message} htmlFor="unitId">
              <select
                id="unitId"
                className={[
                  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
                  'transition-colors duration-150 cursor-pointer',
                  'focus:outline-none focus:ring-2 focus:ring-offset-0',
                  errors.unitId
                    ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-red-200'
                    : 'border-slate-300 focus:border-[#1e3a5f] focus:ring-[#dce8f5]',
                ].join(' ')}
                {...register('unitId')}
              >
                <option value="">Seleccionar unidad...</option>
                {Object.entries(unitOptionsByBlock).map(([block, units]) => (
                  <optgroup key={block} label={block}>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </FormField>

            <FormField label="Tipo de vinculación" required error={errors.relation?.message} htmlFor="relation">
              <Select
                id="relation"
                options={RELATION_OPTIONS.map(r => ({ value: r.value, label: r.label }))}
                error={Boolean(errors.relation)}
                {...register('relation')}
              />
            </FormField>
          </div>

          {/* Relation description hint */}
          {watch('relation') && (
            <p className="mt-2 text-xs text-slate-500">
              {RELATION_OPTIONS.find(r => r.value === watch('relation'))?.description}
            </p>
          )}
        </section>

        {/* ── Observaciones ─────────────────────────────────────────────────── */}
        <FormField label="Observaciones" hint="Opcional" htmlFor="observations">
          <textarea
            id="observations"
            rows={3}
            placeholder="Información adicional relevante sobre el residente..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#dce8f5]"
            {...register('observations')}
          />
        </FormField>
      </form>
    </Modal>
  )
}
