type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[#dcfce7] text-[#16a34a]',
  danger:  'bg-[#fee2e2] text-[#dc2626]',
  warning: 'bg-[#fef3c7] text-[#d97706]',
  info:    'bg-[#dce8f5] text-[#1e3a5f]',
  neutral: 'bg-slate-100 text-slate-600',
}

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-[#16a34a]',
  danger:  'bg-[#dc2626]',
  warning: 'bg-[#d97706]',
  info:    'bg-[#1e3a5f]',
  neutral: 'bg-slate-500',
}

export function Badge({ variant = 'neutral', children, dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClasses[variant]}`} />
      )}
      {children}
    </span>
  )
}
