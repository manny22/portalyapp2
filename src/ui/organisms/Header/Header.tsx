import { useAuth } from '@/shared/hooks/useAuth'
import { Avatar } from '@/ui/atoms'

interface HeaderProps {
  onMobileMenuOpen: () => void
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Left: hamburger (mobile) + property name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Abrir menú"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="hidden text-sm font-medium text-slate-600 sm:block">
          {user?.propertyId ? 'Conjunto Residencial Demo' : 'Janora'}
        </span>
      </div>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-medium text-slate-800 leading-none">
            {user?.fullName ?? '—'}
          </span>
          <span className="mt-0.5 text-xs text-slate-500 leading-none capitalize">
            {user?.role?.toLowerCase().replace(/_/g, ' ') ?? ''}
          </span>
        </div>
        <Avatar initials={user?.fullName?.slice(0, 2) ?? '?'} size="sm" />
        <button
          onClick={logout}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="Cerrar sesión"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
