import { useState } from 'react'
import { useUsers } from '@/shared/hooks/features/useUsers'
import type { User } from '@/core/domain/models/user.model'
import { AppLayout } from '@/ui/templates/AppLayout/AppLayout'
import { PageLayout } from '@/ui/templates/PageLayout/PageLayout'
import { DataTable } from '@/ui/organisms/DataTable/DataTable'
import type { Column } from '@/ui/organisms/DataTable/DataTable'
import { Badge, Button } from '@/ui/atoms'
import { SearchBar } from '@/ui/molecules'

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', PROPERTY_ADMIN: 'Administrador',
  SECURITY_GUARD: 'Vigilante', RESIDENT: 'Residente',
}

const COLUMNS: Column<User>[] = [
  {
    key: 'name',
    header: 'Usuario',
    render: u => (
      <div>
        <p className="font-medium text-slate-800">{u.name.full}</p>
        <p className="text-xs text-slate-500">{u.email.value}</p>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Rol',
    render: u => <Badge variant="info">{ROLE_LABELS[u.role]}</Badge>,
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

export function UsersPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, error, refetch } = useUsers()

  const filtered = (data ?? []).filter(u =>
    u.name.full.toLowerCase().includes(search.toLowerCase()) ||
    u.email.value.includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <PageLayout
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        actions={<Button size="sm">Nuevo usuario</Button>}
        filters={
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre o correo..."
            className="w-full sm:w-72"
          />
        }
      >
        <DataTable
          columns={COLUMNS}
          data={filtered}
          keyExtractor={u => u.id}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          emptyTitle="Sin usuarios"
          emptyDescription="No hay usuarios registrados."
        />
      </PageLayout>
    </AppLayout>
  )
}
