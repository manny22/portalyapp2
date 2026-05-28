import { useState } from 'react'
import { useVisitors, useCreateVisitor, useUpdateVisitor } from '@/shared/hooks/features/useVisitors'
import type { Visitor, CreateVisitorDto, UpdateVisitorDto } from '@/core/domain/models/visitor.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'
import { VisitorFormModal } from './VisitorFormModal'
import { useToast } from '@/shared/hooks/useToast'

const COLUMNS: Column<Visitor>[] = [
  {
    key: 'name',
    header: 'Visitante',
    render: v => (
      <div>
        <p className="font-medium text-slate-800">{v.name.full}</p>
        <p className="text-xs text-slate-500">{v.document.format()}</p>
      </div>
    ),
  },
  {
    key: 'contact',
    header: 'Contacto',
    render: v => (
      <div className="flex flex-col gap-0.5">
        {v.phone ? (
          <p className="text-xs text-slate-600">{v.phone.value}</p>
        ) : (
          <span className="text-xs text-slate-400">Sin teléfono</span>
        )}
        {v.company && (
          <p className="text-xs text-slate-500 italic">{v.company}</p>
        )}
      </div>
    ),
  },
  {
    key: 'observations',
    header: 'Observaciones',
    render: v =>
      v.observations ? (
        <p className="max-w-xs truncate text-xs text-slate-600">{v.observations}</p>
      ) : (
        <span className="text-xs text-slate-400">—</span>
      ),
  },
  {
    key: 'date',
    header: 'Registrado',
    render: v => (
      <span className="text-xs text-slate-500">
        {v.createdAt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
]

export function VisitorsPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null)

  const { data, isLoading, error, refetch } = useVisitors()
  const createVisitor = useCreateVisitor()
  const updateVisitor = useUpdateVisitor()
  const toast = useToast()

  const filtered = (data ?? []).filter(
    v =>
      v.name.full.toLowerCase().includes(search.toLowerCase()) ||
      v.document.number.includes(search) ||
      (v.company ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  function openCreate() {
    setEditingVisitor(null)
    setModalOpen(true)
  }

  function openEdit(visitor: Visitor) {
    setEditingVisitor(visitor)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingVisitor(null)
  }

  async function handleSubmit(payload: CreateVisitorDto | UpdateVisitorDto) {
    try {
      if (editingVisitor) {
        await updateVisitor.mutateAsync({ id: editingVisitor.id, data: payload as UpdateVisitorDto })
        toast.success('Visitante actualizado correctamente')
      } else {
        await createVisitor.mutateAsync(payload as CreateVisitorDto)
        toast.success('Visitante registrado correctamente')
      }
      closeModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el visitante')
    }
  }

  const columnsWithActions: Column<Visitor>[] = [
    ...COLUMNS,
    {
      key: 'actions',
      header: '',
      render: v => (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
            Editar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageLayout
        title="Visitantes"
        description="Registro de visitantes del conjunto"
        actions={
          <Button size="sm" onClick={openCreate}>
            Registrar visitante
          </Button>
        }
        filters={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, documento o empresa..."
            className="w-full sm:w-80"
          />
        }
      >
        <DataTable
          columns={columnsWithActions}
          data={filtered}
          keyExtractor={v => v.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="Sin visitantes"
          emptyDescription="No hay visitantes registrados."
        />
      </PageLayout>

      <VisitorFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={createVisitor.isPending || updateVisitor.isPending}
        visitor={editingVisitor}
      />
    </AppLayout>
  )
}
