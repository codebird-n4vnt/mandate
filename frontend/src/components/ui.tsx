import { forwardRef, type ComponentProps, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------- buttons

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-[0.14em] transition-colors duration-100 disabled:cursor-not-allowed disabled:opacity-40 select-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground disabled:hover:bg-foreground disabled:hover:text-background',
  secondary:
    'bg-background text-foreground border-2 border-foreground hover:bg-foreground hover:text-background disabled:hover:bg-background disabled:hover:text-foreground',
  ghost: 'text-foreground border-2 border-transparent hover:border-foreground',
  danger:
    'bg-background text-alert border-2 border-alert hover:bg-alert hover:text-background disabled:hover:bg-background disabled:hover:text-alert',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[11px]',
  md: 'h-12 px-5 text-xs',
  lg: 'h-16 px-8 text-sm',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export function Button({ variant, size, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

export function ExternalLink({ href, children, className }: { href?: string; children: ReactNode; className?: string }) {
  if (!href) return <span className={className}>{children}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn('underline decoration-1 underline-offset-4 hover:decoration-2', className)}
    >
      {children}
    </a>
  )
}

// ---------------------------------------------------------------- form fields

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string
  hint?: ReactNode
  error?: string | null
  htmlFor?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="eyebrow text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-mono text-xs text-alert" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

const inputBase =
  'w-full bg-transparent border-0 border-b-2 border-foreground/25 py-2 text-lg font-body placeholder:text-foreground/30 focus:border-foreground focus:outline-none disabled:opacity-50 aria-[invalid=true]:border-alert'

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputBase, className)} {...props} />
})

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(inputBase, 'min-h-20 resize-y leading-relaxed', className)} {...props} />
}

export function Select({
  options,
  placeholder = 'Choose…',
  className,
  ...props
}: ComponentProps<'select'> & { options: readonly string[]; placeholder?: string }) {
  return (
    <select className={cn(inputBase, className)} {...props}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------- display

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'solid' | 'alert' | 'ok' | 'muted'
  className?: string
}) {
  const tones = {
    default: 'border-foreground text-foreground',
    solid: 'border-foreground bg-foreground text-background',
    alert: 'border-alert text-alert',
    ok: 'border-ok text-ok',
    muted: 'border-foreground/25 text-muted-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-muted', className)} aria-hidden />
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin', className)} aria-label="Loading" />
}

/** A label/value pair for term sheets and fact lists. */
export function Fact({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <dt className="eyebrow">{label}</dt>
      <dd className="font-display text-xl leading-tight">{children}</dd>
    </div>
  )
}

export function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-foreground/15 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('text-right tabular', strong ? 'font-display text-2xl' : 'font-mono text-sm')}>{children}</dd>
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow?: string
  title: ReactNode
  children?: ReactNode
  aside?: ReactNode
}) {
  return (
    <header className="mb-12 grid gap-8 border-b-4 border-foreground pb-10 md:mb-16 lg:grid-cols-12">
      <div className="lg:col-span-8">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">{title}</h1>
        {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">{children}</div>}
      </div>
      {aside && <div className="lg:col-span-4 lg:self-end">{aside}</div>}
    </header>
  )
}
