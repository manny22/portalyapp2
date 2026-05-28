import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  htmlFor?: string
}

export function FormField({ label, error, hint, required, children, htmlFor }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-0.5 text-[#dc2626]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    </div>
  )
}
