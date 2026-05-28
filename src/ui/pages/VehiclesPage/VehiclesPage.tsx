import { useState } from 'react'
import {
  useVehicles,
  useCreateVehicle,
  useUpdateVehicle,
  useToggleVehicleStatus,
} from '@/shared/hooks/features/useVehicles'
import type { Vehicle, CreateVehicleDto, UpdateVehicleDto } from '@/core/domain/models/vehicle.model'
import type { ParkingSpotType } from '@/core/domain/models/parking-spot.model'
import { PARKING_SPOT_TYPE_LABELS } from '@/core/domain/models/parking-spot.model'
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
  OTHER: 'Otro',
}

const SPOT_TYPE_STYLE: Record<ParkingSpotType, string> = {
  PRIVATE: 'bg-blue-100 text-blue-700',
  COMMON:  'bg-slate-100 text-slate-700',
  VISITOR: 'bg-amber-100 text-amber-700',
}

const COLUMNS: Column<Vehicle>[] = [
  {
    key: 'plate',
    header: 'Placa',
    render: v => (
      <div>
        <span className="font-mono font-bold text-slate-800">{v.plate.format()}</span>
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
    key: 'owner',
    header: 'Propietario',
    render: v => (
      <div>
        <p className="text-sm text-slate-800">
          {v.ownerType === 'RESIDENT' ? v.residentName : v.visitorName}
        </p>
        <span className={`text-xs ${v.ownerType === 'RESIDENT' ? 'text-slate-500' : 'text-amber-600 font-medium'}`}>
          {v.ownerType === 'RESIDENT' ? `Apt. ${v.unitNumber}` : 'Visitante'}
        </span>
      </div>
    ),
  },
  {
    key: 'parking',
    header: 'Parqueadero',
    render: v => {
      if (!v.parkingSpotId) {
        return <span className="text-xs text-slate-400">Sin asignar</span>
      }
      return (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${SPOT_TYPE_STYLE[v.parkingSpotType!]}`}
          >
            {PARKING_SPOT_TYPE_LABELS[v.parkingSpotType!]}
          </span>
          <span className="font-mono text-xs text-slate-600">{v.parkingSpotCode}</span>
          {v.hasCommonParkingAuthorization && v.parkingSpotType === 'COMMON' && (
            <span className="text-xs text-amber-600">★ Autorizado</span>
          )}
        </div>
      )
    },
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
]

type FilterMode = 'all' | 'residents' | 'visitors'

export function VehiclesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  const { data, isLoading, error, refetch } = useVehicles()
  const createVehicle = useCreateVehicle()
  const updateVehicle = useUpdateVehicle()
  const toggleStatus = useToggleVehicleStatus()
  const toast = useToast()

  const filtered = (data ?? []).filter(v => {
    const ownerName = v.ownerType === 'RESIDENT' ? (v.residentName ?? '') : (v.visitorName ?? '')
    const matchesSearch =
      v.plate.format().includes(search.toUpperCase()) ||
      `${v.brand ?? ''} ${v.model ?? ''}`.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'residents') return v.ownerType === 'RESIDENT'
    if (filter === 'visitors') return v.ownerType === 'VISITOR'
    return true
  })

  const residentCount = (data ?? []).filter(v => v.ownerType === 'RESIDENT').length
  const visitorCount = (data ?? []).filter(v => v.ownerType === 'VISITOR').length

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

  async function handleToggle(vehicle: Vehicle) {
    try {
      await toggleStatus.mutateAsync(vehicle.id)
      toast.success(`Vehículo ${vehicle.isActive ? 'desactivado' : 'activado'} correctamente`)
    } catch {
      toast.error('Error al cambiar el estado del vehículo')
    }
  }

  const columnsWithActions: Column<Vehicle>[] = [
    ...COLUMNS,
    {
      key: 'actions',
      header: '',
      render: v => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant={v.isActive ? 'danger' : 'ghost'}
            onClick={() => handleToggle(v)}
            loading={toggleStatus.isPending}
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
        description="Vehículos registrados en el conjunto"
        actions={
          <Button size="sm" onClick={openCreate}>
            Registrar vehículo
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar por placa, marca o propietario..."
              className="w-full sm:w-80"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({data?.length ?? 0})
              </button>
              <button
                onClick={() => setFilter('residents')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'residents' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Residentes ({residentCount})
              </button>
              <button
                onClick={() => setFilter('visitors')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'visitors' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Visitantes ({visitorCount})
              </button>
            </div>
          </div>
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
          emptyDescription="No hay vehículos que coincidan con los filtros."
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
