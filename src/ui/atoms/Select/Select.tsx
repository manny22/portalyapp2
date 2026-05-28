import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  placeholder?: string
  error?: boolean
}

export function Select({ options, placeholder, error = false, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={[
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
        'transition-colors duration-150 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:bg-slate-50 disabled:cursor-not-allowed',
        error
          ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-red-200'
          : 'border-slate-300 focus:border-[#1e3a5f] focus:ring-[#dce8f5]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
