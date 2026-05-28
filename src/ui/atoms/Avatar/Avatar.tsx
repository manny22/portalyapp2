type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  initials: string
  size?: AvatarSize
  color?: 'brand' | 'slate'
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-11 w-11 text-base',
}

const colorClasses = {
  brand: 'bg-[#1e3a5f] text-white',
  slate: 'bg-slate-200 text-slate-700',
}

export function Avatar({ initials, size = 'md', color = 'brand' }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase ${sizeClasses[size]} ${colorClasses[color]}`}
    >
      {initials.slice(0, 2)}
    </span>
  )
}
