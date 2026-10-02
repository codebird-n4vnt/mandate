import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: number
  tone: 'ok' | 'alert'
  title: string
  body?: string
  href?: string
}

type Push = (toast: Omit<Toast, 'id'>) => void

const ToastContext = createContext<Push>(() => {})

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext)

export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const push = useCallback<Push>(
    (toast) => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t.slice(-3), { ...toast, id }])
      setTimeout(() => dismiss(id), toast.tone === 'alert' ? 9000 : 6000)
    },
    [dismiss],
  )

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 border-2 bg-background p-4 shadow-[6px_6px_0_0_#0a0a0a]',
                t.tone === 'alert' ? 'border-alert' : 'border-foreground',
              )}
            >
              {t.tone === 'alert' ? (
                <TriangleAlert className="mt-0.5 size-5 shrink-0 text-alert" />
              ) : (
                <Check className="mt-0.5 size-5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{t.title}</p>
                {t.body && <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>}
                {t.href && (
                  <a href={t.href} target="_blank" rel="noreferrer" className="mt-2 inline-block font-mono text-xs underline">
                    View transaction ↗
                  </a>
                )}
              </div>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="p-0.5 hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
