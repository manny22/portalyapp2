import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  error?: boolean
}

export function Input({ leftIcon, rightIcon, error = false, className = '', ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {leftIcon && (
        <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
          {leftIcon}
        </span>
      )}
      <input
        {...props}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          error
            ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-red-200'
            : 'border-slate-300 focus:border-[#1e3a5f] focus:ring-[#dce8f5]',
          leftIcon ? 'pl-9' : '',
          rightIcon ? 'pr-9' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
      {rightIcon && (
        <span className="absolute right-3 text-slate-400 flex items-center">
          {rightIcon}
        </span>
      )}
    </div>
  )
}
