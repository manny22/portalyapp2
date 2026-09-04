interface PageLayoutProps {
  title: string
  description?: string
  actions?: React.ReactNode
  filters?: React.ReactNode
  children: React.ReactNode
}

export function PageLayout({ title, description, actions, filters, children }: PageLayoutProps) {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 lg:text-2xl">{title}</h1>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {/* Filters row */}
      {filters && <div className="flex flex-wrap items-center gap-3">{filters}</div>}

      {/* Main content */}
      {children}
    </div>
  )
}
