import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, X } from 'lucide-react'
import { ENS_APP_URL } from '@/config/contracts'
import { formatWholeUsdc } from '@/lib/format'
import type { Match, MatchTier } from '@/lib/matching'
import { FIELD, type Profile } from '@/lib/profile'
import { cn } from '@/lib/utils'
import { Badge, ExternalLink } from './ui'

export function MatchBadge({ match }: { match: Match }) {
  const tone: Record<MatchTier, 'solid' | 'default' | 'muted'> = {
    Strong: 'solid',
    Good: 'default',
    Partial: 'muted',
    Weak: 'muted',
  }
  return (
    <Badge tone={tone[match.tier]}>
      {match.tier} match · {match.met}/{match.total}
    </Badge>
  )
}

export function EnsName({ profile, className }: { profile: Profile; className?: string }) {
  return (
    <ExternalLink href={`${ENS_APP_URL}/${profile.name}`} className={cn('font-mono text-xs break-all', className)}>
      {profile.name} ↗
    </ExternalLink>
  )
}

/** The headline facts of a profile, in the order a counterpart reads them. */
export function profileFacts(profile: Profile) {
  const r = profile.records
  const role = profile.role
  return [
    { label: role === 'borrower' ? 'Needs' : 'Lends up to', value: r.amount ? `${formatWholeUsdc(r.amount)} USDC` : '—' },
    { label: role === 'borrower' ? 'Can pay' : 'Seeks', value: r.roi ? `${r.roi}% APR` : '—' },
    { label: role === 'borrower' ? 'Term' : 'Up to', value: r.tenure ? `${r.tenure} months` : '—' },
    { label: FIELD.loanType.label[role], value: r.loanType || '—' },
    { label: FIELD.industry.label[role], value: r.industry || '—' },
    { label: FIELD.location.label[role], value: r.location || '—' },
  ]
}

export function ProfileCard({ profile, match }: { profile: Profile; match?: Match }) {
  const facts = profileFacts(profile)
  return (
    <Link
      to={`/p/${profile.role}/${profile.label}`}
      className="group flex flex-col border-2 border-foreground bg-background transition-colors duration-100 hover:bg-foreground hover:text-background"
    >
      <div className="flex items-start justify-between gap-4 border-b border-current/20 p-5">
        <div className="min-w-0">
          <h3 className="font-display text-2xl leading-tight">{profile.records.display || profile.label}</h3>
          <p className="mt-1 truncate font-mono text-[11px] opacity-60">{profile.name}</p>
        </div>
        <ArrowUpRight className="size-6 shrink-0 transition-transform group-hover:rotate-45" strokeWidth={1.5} />
      </div>
      {profile.records.description && (
        <p className="line-clamp-2 px-5 pt-4 text-sm leading-relaxed opacity-80">{profile.records.description}</p>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-5 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] opacity-60">{f.label}</dt>
            <dd className="truncate text-sm">{f.value}</dd>
          </div>
        ))}
      </dl>
      {match && (
        <div className="mt-auto flex items-center justify-between border-t border-current/20 px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
            {match.tier} match · {match.met}/{match.total}
          </span>
          <span className="flex gap-1" aria-hidden>
            {match.criteria.map((c) => (
              <span key={c.key} className={cn('size-2.5 border border-current', c.met && 'bg-current')} />
            ))}
          </span>
        </div>
      )}
    </Link>
  )
}

/** Side-by-side check of each criterion between a borrower and a lender. */
export function MatchTable({ match }: { match: Match }) {
  return (
    <div className="overflow-x-auto border-2 border-foreground">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-foreground">
            <th className="eyebrow px-4 py-3 font-normal">Criterion</th>
            <th className="eyebrow px-4 py-3 font-normal">Borrower</th>
            <th className="eyebrow px-4 py-3 font-normal">Lender</th>
            <th className="eyebrow px-4 py-3 font-normal">Fit</th>
          </tr>
        </thead>
        <tbody>
          {match.criteria.map((c) => (
            <tr key={c.key} className="border-b border-foreground/15 last:border-b-0">
              <td className="px-4 py-3 font-display text-lg">{c.label}</td>
              <td className="px-4 py-3 text-sm">{display(c.key, c.borrower)}</td>
              <td className="px-4 py-3 text-sm">{display(c.key, c.lender)}</td>
              <td className="px-4 py-3">
                <span className={cn('flex items-center gap-2 text-sm', c.met ? 'text-ok' : 'text-alert')}>
                  {c.met ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
                  <span className="text-foreground/80">{c.reason}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function display(key: string, value: string) {
  if (!value) return <span className="text-muted-foreground">—</span>
  if (key === 'amount') return `${formatWholeUsdc(value)} USDC`
  if (key === 'roi') return `${value}%`
  if (key === 'tenure') return `${value} mo`
  return value
}
