import { useState } from 'react'
import {
  useResidents,
  useCreateResident,
  useUpdateResident,
  useToggleResidentStatus,
} from '@/shared/hooks/features/useResidents'
import type { Resident, CreateResidentDto, UpdateResidentDto } from '@/core/domain/models/resident.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'
import { ResidentFormModal } from './ResidentFormModal'
import { useToast } from '@/shared/hooks/useToast'

const RELATION_LABELS: Record<string, string> = {
  OWNER: 'Propietario',
  TENANT: 'Arrendatario',
  FAMILY: 'Familiar',
  AUTHORIZED: 'Autorizado',
}

const COLUMNS: Column<Resident>[] = [
  {
    key: 'name',
    header: 'Residente',
    render: r => (
      <div>
        <p className="font-medium text-slate-800">{r.name.full}</p>
        <p className="text-xs text-slate-500">{r.document.format()}</p>
      </div>
    ),
  },
  {
    key: 'unit',
    header: 'Unidad',
    render: r => (
      <div>
        <p className="font-mono text-sm text-slate-800">Apt. {r.unitNumber}</p>
        {r.blockName && <p className="text-xs text-slate-500">{r.blockName}</p>}
      </div>
    ),
  },
  {
    key: 'contact',
    header: 'Contacto',
    render: r => (
      <div className="flex flex-col gap-0.5">
        {r.email && <p className="text-xs text-slate-600">{r.email.value}</p>}
        {r.phone && <p className="text-xs text-slate-500">{r.phone.value}</p>}
        {!r.email && !r.phone && <span className="text-xs text-slate-400">Sin contacto</span>}
      </div>
    ),
  },
  {
    key: 'relation',
    header: 'Vinculación',
    render: r => (
      <span className="text-sm text-slate-700">{RELATION_LABELS[r.relation] ?? r.relation}</span>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: r => (
      <Badge variant={r.isActive ? 'success' : 'danger'} dot>
        {r.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
]

export function ResidentsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingResident, setEditingResident] = useState<Resident | null>(null)

  const { data, isLoading, error, refetch } = useResidents()
  const createResident = useCreateResident()
  const updateResident = useUpdateResident()
  const toggleStatus = useToggleResidentStatus()
  const toast = useToast()

  const filtered = (data ?? []).filter(
    r =>
      r.name.full.toLowerCase().includes(search.toLowerCase()) ||
      r.document.format().toLowerCase().includes(search.toLowerCase()),
  )

  function openCreate() {
    setEditingResident(null)
    setModalOpen(true)
  }

  function openEdit(resident: Resident) {
    setEditingResident(resident)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingResident(null)
  }

  async function handleSubmit(payload: CreateResidentDto | UpdateResidentDto) {
    try {
      if (editingResident) {
        await updateResident.mutateAsync({ id: editingResident.id, data: payload as UpdateResidentDto })
        toast.success('Residente actualizado correctamente')
      } else {
        await createResident.mutateAsync(payload as CreateResidentDto)
        toast.success('Residente registrado correctamente')
      }
      closeModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el residente')
    }
  }

  async function handleToggle(resident: Resident) {
    try {
      await toggleStatus.mutateAsync(resident.id)
      toast.success(`Residente ${resident.isActive ? 'desactivado' : 'activado'} correctamente`)
    } catch {
      toast.error('Error al cambiar el estado del residente')
    }
  }

  const columnsWithActions: Column<Resident>[] = [
    ...COLUMNS,
    {
      key: 'actions',
      header: '',
      render: r => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant={r.isActive ? 'danger' : 'ghost'}
            onClick={() => handleToggle(r)}
            loading={toggleStatus.isPending}
          >
            {r.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageLayout
        title="Residentes"
        description="Gestión de residentes del conjunto"
        actions={
          <Button size="sm" onClick={openCreate}>
            Nuevo residente
          </Button>
        }
        filters={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre o documento..."
            className="w-full sm:w-72"
          />
        }
      >
        <DataTable
          columns={columnsWithActions}
          data={filtered}
          keyExtractor={r => r.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="Sin residentes"
          emptyDescription="Aún no hay residentes registrados."
        />
      </PageLayout>

      <ResidentFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={createResident.isPending || updateResident.isPending}
        resident={editingResident}
      />
    </AppLayout>
  )
}
