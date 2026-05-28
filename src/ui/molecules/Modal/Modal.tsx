import { useEffect, type ReactNode } from 'react'
import { Button } from '@/ui/atoms'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-t-2xl sm:rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
          <h2 id="modal-title" className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end border-t border-slate-100 px-5 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalFooter({
  onCancel,
  onConfirm,
  confirmLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  loading = false,
  danger = false,
}: {
  onCancel: () => void
  onConfirm?: () => void
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  danger?: boolean
}) {
  return (
    <>
      <Button variant="ghost" size="md" onClick={onCancel} disabled={loading} fullWidth>
        {cancelLabel}
      </Button>
      {onConfirm && (
        <Button
          variant={danger ? 'danger' : 'primary'}
          size="md"
          onClick={onConfirm}
          loading={loading}
          fullWidth
        >
          {confirmLabel}
        </Button>
      )}
    </>
  )
}
