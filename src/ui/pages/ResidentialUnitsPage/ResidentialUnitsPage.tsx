import { useState, useCallback, useEffect } from 'react'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable, type Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { ResidentialUnitFormModal } from '@/ui/organisms/ResidentialUnitFormModal/ResidentialUnitFormModal'
import type {
  ResidentialUnit,
  CreateResidentialUnitDto,
  UpdateResidentialUnitDto,
} from '@/core/domain/models/residential-unit.model'
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

  async function handleSubmit(data: CreateResidentialUnitDto | UpdateResidentialUnitDto) {
    try {
      if (selectedUnit) {
        await container.residentialUnitRepository.update(
          selectedUnit.id,
          data as UpdateResidentialUnitDto
        )
      } else {
        await container.residentialUnitRepository.create(data as CreateResidentialUnitDto)
      }
      await loadUnits()
      setModalOpen(false)
      setSelectedUnit(null)
    } catch (error) {
      console.error('Error saving unit:', error)
    }
  }

  return (
    <AppLayout>
      <PageLayout
        title="Residencias"
        description="Administra las unidades residenciales"
        actions={
          <Button
            onClick={() => {
              setSelectedUnit(null)
              setModalOpen(true)
            }}
          >
            Crear residencia
          </Button>
        }
      >
        <DataTable
          columns={COLUMNS}
          data={units}
          keyExtractor={u => u.id}
          isLoading={loading}
          emptyTitle="Sin residencias"
          emptyDescription="No hay residencias registradas aún."
          emptyAction={{
            label: 'Crear residencia',
            onClick: () => {
              setSelectedUnit(null)
              setModalOpen(true)
            },
          }}
        />

        <ResidentialUnitFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedUnit(null)
          }}
          onSubmit={handleSubmit}
          loading={loading}
          unit={selectedUnit}
        />
      </PageLayout>
    </AppLayout>
  )
}
