import { useState, useCallback, useEffect } from 'react'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable, type Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { ResidentialUnitFormModal } from '@/ui/organisms/ResidentialUnitFormModal/ResidentialUnitFormModal'
import type { ResidentialUnit, CreateResidentialUnitDto, UpdateResidentialUnitDto } from '@/core/domain/models/residential-unit.model'
import { container } from '@/infrastructure/di/container'

const COLUMNS: Column<ResidentialUnit>[] = [
  {
    key: 'number',
    header: 'Número',
    render: u => <span className="font-mono text-sm font-medium">{u.number}</span>,
  },
  {
    key: 'floor',
    header: 'Piso',
    render: u => <span className="text-sm text-slate-700">{u.floor ?? '—'}</span>,
  },
  {
    key: 'blockId',
    header: 'Bloque',
    render: u => <span className="text-sm text-slate-700">{u.blockId ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: u => (
      <Badge variant={u.isActive ? 'success' : 'danger'} dot>
        {u.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
]

export function ResidentialUnitsPage() {
  const [units, setUnits] = useState<ResidentialUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<ResidentialUnit | null>(null)

  const loadUnits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await container.residentialUnitRepository.findAll({})
      setUnits(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUnits()
  }, [loadUnits])

  const handleCreate = async (data: CreateResidentialUnitDto) => {
    try {
      await container.residentialUnitRepository.create(data)
      await loadUnits()
      setModalOpen(false)
    } catch (error) {
      console.error('Error creating unit:', error)
    }
  }

  const handleUpdate = async (data: UpdateResidentialUnitDto) => {
    if (!selectedUnit) return
    try {
      await container.residentialUnitRepository.update(selectedUnit.id, data)
      await loadUnits()
      setModalOpen(false)
      setSelectedUnit(null)
    } catch (error) {
      console.error('Error updating unit:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta residencia?')) return
    try {
      await container.residentialUnitRepository.delete(id)
      await loadUnits()
    } catch (error) {
      console.error('Error deleting unit:', error)
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Residencias</h1>
            <p className="mt-1 text-sm text-slate-600">Administra las unidades residenciales</p>
          </div>
          <Button onClick={() => { setSelectedUnit(null); setModalOpen(true) }}>
            Crear residencia
          </Button>
        </div>

        <DataTable
          columns={COLUMNS}
          data={units}
          keyExtractor={u => u.id}
          isLoading={loading}
          emptyTitle="Sin residencias"
          emptyDescription="No hay residencias registradas aún."
          emptyAction={{ label: 'Crear residencia', onClick: () => { setSelectedUnit(null); setModalOpen(true) } }}
        />

        <ResidentialUnitFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setSelectedUnit(null) }}
          onSubmit={selectedUnit ? handleUpdate : handleCreate}
          loading={loading}
          unit={selectedUnit}
        />
      </div>
    </PageLayout>
  )
}
