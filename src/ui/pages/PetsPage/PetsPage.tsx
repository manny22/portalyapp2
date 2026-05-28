import { useState } from 'react'
import { usePets, useCreatePet, useUpdatePet, useTogglePetStatus } from '@/shared/hooks/features/usePets'
import type { Pet, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'
import { PetFormModal } from './PetFormModal'
import { useToast } from '@/shared/hooks/useToast'

const TYPE_LABELS: Record<string, string> = {
  DOG: 'Perro',
  CAT: 'Gato',
  BIRD: 'Ave',
  OTHER: 'Otro',
}

const SIZE_LABELS: Record<string, string> = {
  SMALL: 'Pequeño',
  MEDIUM: 'Mediano',
  LARGE: 'Grande',
}

function VaccinationStatus({ pet }: { pet: Pet }) {
  if (!pet.vaccinationDate) {
    return (
      <Badge variant="warning" dot>
        Sin registro
      </Badge>
    )
  }
  const expiry = pet.vaccinationExpiry
  if (expiry && expiry < new Date()) {
    return (
      <Badge variant="danger" dot>
        Vencida
      </Badge>
    )
  }
  return (
    <Badge variant="success" dot>
      Al día
    </Badge>
  )
}

function DangerBadge({ pet }: { pet: Pet }) {
  if (pet.breedClassification === 'SPECIAL_PERMIT') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        ⚠️ Perm. especial
      </span>
    )
  }
  return null
}

const COLUMNS: Column<Pet>[] = [
  {
    key: 'name',
    header: 'Mascota',
    render: p => (
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-slate-800">{p.name}</p>
        <p className="text-xs text-slate-500">
          {TYPE_LABELS[p.type]}
          {p.breed ? ` · ${p.breed}` : ''}
          {p.size ? ` · ${SIZE_LABELS[p.size]}` : ''}
          {p.weight ? ` · ${p.weight} kg` : ''}
        </p>
        <DangerBadge pet={p} />
      </div>
    ),
  },
  {
    key: 'resident',
    header: 'Propietario',
    render: p => (
      <div>
        <p className="text-sm text-slate-800">{p.residentName}</p>
        <p className="text-xs text-slate-500 font-mono">Apt. {p.unitNumber}</p>
      </div>
    ),
  },
  {
    key: 'vaccination',
    header: 'Vacunación',
    render: p => (
      <div className="flex flex-col gap-1">
        <VaccinationStatus pet={p} />
        {p.vaccinationExpiry && (
          <span className="text-xs text-slate-400">
            Vence: {p.vaccinationExpiry.toLocaleDateString('es-CO')}
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'legal',
    header: 'Requisitos Ley 746',
    render: p => {
      if (!p.isPotentiallyDangerous) {
        return <span className="text-xs text-slate-400">No aplica</span>
      }
      const hasInsurance = Boolean(p.insurancePolicyNumber)
      const hasRegistry = Boolean(p.municipalRegistrationNumber)
      return (
        <div className="flex flex-col gap-1 text-xs">
          <span className={hasInsurance ? 'text-emerald-600' : 'text-red-500'}>
            {hasInsurance ? '✓' : '✗'} Seguro civil
          </span>
          <span className={hasRegistry ? 'text-emerald-600' : 'text-red-500'}>
            {hasRegistry ? '✓' : '✗'} Registro municipal
          </span>
        </div>
      )
    },
  },
  {
    key: 'status',
    header: 'Estado',
    render: p => (
      <Badge variant={p.isActive ? 'success' : 'danger'} dot>
        {p.isActive ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
]

type FilterMode = 'all' | 'dangerous' | 'unvaccinated'

export function PetsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  const { data, isLoading, error, refetch } = usePets()
  const createPet = useCreatePet()
  const updatePet = useUpdatePet()
  const toggleStatus = useTogglePetStatus()
  const toast = useToast()

  const now = new Date()

  const filtered = (data ?? []).filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.residentName.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'dangerous') return p.isPotentiallyDangerous
    if (filter === 'unvaccinated')
      return !p.vaccinationDate || (p.vaccinationExpiry !== null && p.vaccinationExpiry < now)
    return true
  })

  const dangerousCount = (data ?? []).filter(p => p.isPotentiallyDangerous).length
  const unvaccinatedCount = (data ?? []).filter(
    p => !p.vaccinationDate || (p.vaccinationExpiry !== null && p.vaccinationExpiry < now),
  ).length

  function openCreate() {
    setEditingPet(null)
    setModalOpen(true)
  }

  function openEdit(pet: Pet) {
    setEditingPet(pet)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPet(null)
  }

  async function handleSubmit(payload: CreatePetDto | UpdatePetDto) {
    try {
      if (editingPet) {
        await updatePet.mutateAsync({ id: editingPet.id, data: payload as UpdatePetDto })
        toast.success('Mascota actualizada correctamente')
      } else {
        await createPet.mutateAsync(payload as CreatePetDto)
        toast.success('Mascota registrada correctamente')
      }
      closeModal()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar la mascota')
    }
  }

  async function handleToggle(pet: Pet) {
    try {
      await toggleStatus.mutateAsync(pet.id)
      toast.success(`Mascota ${pet.isActive ? 'desactivada' : 'activada'} correctamente`)
    } catch {
      toast.error('Error al cambiar el estado')
    }
  }

  const columnsWithActions: Column<Pet>[] = [
    ...COLUMNS,
    {
      key: 'actions',
      header: '',
      render: p => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant={p.isActive ? 'danger' : 'ghost'}
            onClick={() => handleToggle(p)}
            loading={toggleStatus.isPending}
          >
            {p.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <PageLayout
        title="Mascotas"
        description="Mascotas registradas en el conjunto — Ley 746 de 2002"
        actions={
          <Button size="sm" onClick={openCreate}>
            Registrar mascota
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar mascota o propietario..."
              className="w-full sm:w-72"
            />
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-[#1e3a5f] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({data?.length ?? 0})
              </button>
              <button
                onClick={() => setFilter('dangerous')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'dangerous'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                ⚠️ Peligrosas ({dangerousCount})
              </button>
              <button
                onClick={() => setFilter('unvaccinated')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === 'unvaccinated'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Sin vacuna ({unvaccinatedCount})
              </button>
            </div>
          </div>
        }
      >
        <DataTable
          columns={columnsWithActions}
          data={filtered}
          keyExtractor={p => p.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="Sin mascotas"
          emptyDescription="No hay mascotas que coincidan con los filtros."
        />
      </PageLayout>

      <PetFormModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        loading={createPet.isPending || updatePet.isPending}
        pet={editingPet}
      />
    </AppLayout>
  )
}
