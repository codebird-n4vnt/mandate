import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-6" onMouseDown={onClose}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-rise border-2 border-foreground bg-background outline-none sm:shadow-[8px_8px_0_0_#0a0a0a]"
      >
        <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-4">
          <h2 className="font-display text-2xl italic">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-foreground hover:text-background" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
