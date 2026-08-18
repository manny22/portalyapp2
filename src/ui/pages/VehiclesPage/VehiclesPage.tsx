import { useState } from 'react'
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useToggleVehicleStatus,
} from '@/shared/hooks/features/useVehicles'
import type { Vehicle, CreateVehicleDto, UpdateVehicleDto } from '@/core/domain/models/vehicle.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'
import { VehicleFormModal } from './VehicleFormModal'
import { useToast } from '@/shared/hooks/useToast'

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  CAR: 'Automóvil',
  MOTORCYCLE: 'Motocicleta',
  BICYCLE: 'Bicicleta',
  TRUCK: 'Camión',
  OTHER: 'Otro',
}

const COLUMNS: Column<Vehicle>[] = [
  {
    key: 'plate',
    header: 'Placa',
    render: v => (
      <div>
        <span className="font-mono font-bold text-slate-800">{v.plate}</span>
        <p className="text-xs text-slate-500 mt-0.5">{VEHICLE_TYPE_LABELS[v.type]}</p>
      </div>
    ),
  },
  {
    key: 'info',
    header: 'Vehículo',
    render: v => (
      <div>
        <p className="text-sm font-medium text-slate-800">
          {[v.brand, v.model].filter(Boolean).join(' ') || '—'}
        </p>
        {v.color && <p className="text-xs text-slate-500">{v.color}</p>}
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Estado',
    render: v => (
      <Badge variant={v.isActive ? 'success' : 'danger'} dot>
        {v.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    key: 'date',
    header: 'Registrado',
    render: v => (
      <span className="text-xs text-slate-500">
        {new Date(v.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    ),
  },
]

export function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const { data, isLoading, error, refetch } = useVehicles()
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const toggleStatus = useToggleVehicleStatus()
  const toast = useToast()

  const filtered = (data ?? []).filter(v => {
    return (
      v.plate.toUpperCase().includes(search.toUpperCase()) ||
      `${v.brand ?? ''} ${v.model ?? ''}`.toLowerCase().includes(search.toLowerCase()) ||
      v.color?.toLowerCase().includes(search.toLowerCase())
    )
  })

  function openCreate() {
    setEditingVehicle(null)
    setModalOpen(true)
  }

  function openEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingVehicle(null)
  }

  async function handleSubmit(payload: CreateVehicleDto | UpdateVehicleDto) {
    try {
      if (editingVehicle) {
        await updateVehicle.mutateAsync({ id: editingVehicle.id, data: payload as UpdateVehicleDto })
        toast.success('Vehículo actualizado correctamente')
      } else {
        await createVehicle.mutateAsync(payload as CreateVehicleDto)
        toast.success('Vehículo registrado correctamente')
      }
      closeModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar el vehículo')
    }
  }

  async function handleToggleStatus(vehicle: Vehicle) {
    try {
      await toggleStatus.mutateAsync(vehicle.id)
      toast.success(`Vehículo ${vehicle.isActive ? 'desactivado' : 'activado'} correctamente`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar el estado')
    }
  }

  const columnsWithActions: Column<Vehicle>[] = [
    ...COLUMNS,
    {
      key: 'actions',
      header: '',
      render: v => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant={v.isActive ? 'danger' : 'success'}
            onClick={() => handleToggleStatus(v)}
          >
            {v.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageLayout
        title="Vehículos"
        description="Registro de vehículos registrados"
        actions={
          <Button size="sm" onClick={openCreate}>
            Registrar vehículo
          </Button>
        }
        filters={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por placa, marca o modelo..."
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
          emptyTitle="Sin vehículos"
          emptyDescription="No hay vehículos registrados."
        />
      </PageLayout>

      <VehicleFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={createVehicle.isPending || updateVehicle.isPending}
        vehicle={editingVehicle}
      />
    </AppLayout>
  )
}
