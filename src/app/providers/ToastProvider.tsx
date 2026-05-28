import { useState, useCallback } from 'react'
import { ToastContext } from '@/shared/hooks/useToast'
import type { Toast, ToastType } from '@/shared/hooks/useToast'

function generateId() {
  return Math.random().toString(36).slice(2)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((type: ToastType, message: string) => {
    const id = generateId()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext
      value={{
        toasts,
        success: msg => add('success', msg),
        error: msg => add('error', msg),
        info: msg => add('info', msg),
        warning: msg => add('warning', msg),
        dismiss,
      }}
    >
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  )
}

function ToastList({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  const colorMap: Record<ToastType, string> = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-white',
    info: 'bg-brand text-white',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={[
            'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg min-w-64 max-w-sm text-sm font-medium',
            colorMap[t.type],
          ].join(' ')}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="opacity-75 hover:opacity-100">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

