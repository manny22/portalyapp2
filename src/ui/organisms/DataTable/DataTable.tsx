import { Spinner } from '@/ui/atoms'
import { EmptyState, ErrorState } from '@/ui/molecules'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No se encontraron registros.',
  emptyAction,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            {columns.map(col => (
              <th
                key={col.key}
                className={[
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500',
                  col.className ?? '',
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map(row => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50 transition-colors">
              {columns.map(col => (
                <td
                  key={col.key}
                  className={['px-4 py-3 text-sm text-slate-700', col.className ?? ''].join(' ')}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
