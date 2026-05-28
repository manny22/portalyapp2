import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  color?: 'brand' | 'success' | 'danger' | 'warning'
  loading?: boolean
  to?: string
}

const colorClasses = {
  brand:   { icon: 'bg-[#dce8f5] text-[#1e3a5f]',  value: 'text-[#1e3a5f]' },
  success: { icon: 'bg-[#dcfce7] text-[#16a34a]',   value: 'text-[#16a34a]' },
  danger:  { icon: 'bg-[#fee2e2] text-[#dc2626]',   value: 'text-[#dc2626]' },
  warning: { icon: 'bg-[#fef3c7] text-[#d97706]',   value: 'text-[#d97706]' },
}

const baseClass =
  'flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-200'

function CardContent({ label, value, icon, color, loading }: Omit<StatCardProps, 'to'>) {
  const colors = colorClasses[color ?? 'brand']
  return (
    <>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}>
        <span className="h-6 w-6">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        {loading ? (
          <div className="mt-1 h-7 w-16 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className={`text-2xl font-bold leading-tight ${colors.value}`}>{value}</p>
        )}
      </div>
    </>
  )
}

export function StatCard({ label, value, icon, color = 'brand', loading = false, to }: StatCardProps) {
  if (to) {
    return (
      <Link to={to} className={`${baseClass} cursor-pointer hover:border-slate-200 group`}>
        <CardContent label={label} value={value} icon={icon} color={color} loading={loading} />
      </Link>
    )
  }

  return (
    <div className={baseClass}>
      <CardContent label={label} value={value} icon={icon} color={color} loading={loading} />
    </div>
  )
}
