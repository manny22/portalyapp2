type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  label?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
}

export function Spinner({ size = 'md', label = 'Cargando...' }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2" role="status">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-slate-200 border-t-[#1e3a5f]`}
      />
      {label && <span className="text-sm text-slate-500">{label}</span>}
    </div>
  )
}

export function PageSpinner() {
  return (
    <div className="flex h-full min-h-64 w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
