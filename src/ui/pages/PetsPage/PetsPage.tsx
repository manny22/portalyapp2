import { useMemo, useState } from 'react'
import {
  usePets,
  useCreatePet,
  useUpdatePet,
  useTogglePetStatus,
} from '@/shared/hooks/features/usePets'
import { useResidents } from '@/shared/hooks/features/useResidents'
import type { Pet, CreatePetDto, UpdatePetDto } from '@/core/domain/models/pet.model'
import { classifyBreed } from '@/shared/constants/pet-breeds'
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

function DangerBadge({ breed }: { breed?: string }) {
  const classification = classifyBreed(breed)
  if (classification === 'SPECIAL_PERMIT') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        ⚠️ Permiso especial
      </span>
    )
  }
  if (classification === 'PROHIBITED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        ⛔ Raza prohibida
      </span>
    )
  }
  return null
}

type FilterMode = 'all' | 'dangerous'

export function PetsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  const { data, isLoading, error, refetch } = usePets()
  const { data: residents = [] } = useResidents()
  const createPet = useCreatePet()
  const updatePet = useUpdatePet()
  const toggleStatus = useTogglePetStatus()
  const toast = useToast()

  const residentNames = useMemo(() => {
    const map = new Map<string, string>()
    residents.forEach(r => map.set(r.id, `${r.firstName} ${r.lastName}`))
    return map
  }, [residents])

  const columns: Column<Pet>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Mascota',
        render: p => (
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-slate-800">{p.name}</p>
            <p className="text-xs text-slate-500">
              {p.type ? (TYPE_LABELS[p.type] ?? p.type) : 'Sin tipo'}
              {p.breed ? ` · ${p.breed}` : ''}
              {p.size ? ` · ${SIZE_LABELS[p.size] ?? p.size}` : ''}
              {p.weight ? ` · ${p.weight} kg` : ''}
            </p>
            <DangerBadge breed={p.breed} />
          </div>
        ),
      },
      {
        key: 'resident',
        header: 'Propietario',
        render: p => (
          <p className="text-sm text-slate-800">{residentNames.get(p.residentId) ?? '—'}</p>
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
                Vence: {new Date(p.vaccinationExpiry).toLocaleDateString('es-CO')}
              </span>
            )}
          </div>
        ),
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
    ],
    [residentNames]
  )

  const filtered = (data ?? []).filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (residentNames.get(p.residentId) ?? '').toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === 'dangerous') return classifyBreed(p.breed) !== 'STANDARD'
    return true
  })

  const dangerousCount = (data ?? []).filter(p => classifyBreed(p.breed) !== 'STANDARD').length

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
    ...columns,
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
                  filter === 'all'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
