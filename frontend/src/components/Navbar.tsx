import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isLocal } from '@/config/chains'
import { useMyLoans } from '@/hooks/useLoans'
import { WalletButton } from './WalletButton'

const LINKS = [
  { to: '/market', label: 'Market' },
  { to: '/borrower', label: 'Borrow' },
  { to: '/lender', label: 'Lend' },
  { to: '/loans', label: 'Loans' },
]

/** Offers waiting for this wallet to accept, for the badge on "Loans". */
function useInboxCount() {
  const { data } = useMyLoans()
  return data?.borrowing.filter((l) => l.status === 'Offered').length ?? 0
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const inbox = useInboxCount()

  const link = (l: (typeof LINKS)[number]) => (
    <NavLink
      key={l.to}
      to={l.to}
      onClick={() => setOpen(false)}
      className={({ isActive }) =>
        cn(
          'relative font-mono text-xs uppercase tracking-[0.16em] underline-offset-8 hover:underline',
          isActive && 'underline decoration-2',
        )
      }
    >
      {l.label}
      {l.to === '/loans' && inbox > 0 && (
        <span
          className="ml-1.5 inline-flex min-w-5 items-center justify-center bg-alert px-1 text-[10px] text-background"
          aria-label={`${inbox} offer${inbox === 1 ? '' : 's'} waiting`}
        >
          {inbox}
        </span>
      )}
    </NavLink>
  )

  return (
    <nav className="sticky top-0 z-30 border-b-2 border-foreground bg-background/95 backdrop-blur">
      {isLocal && (
        <div className="bg-foreground px-4 py-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-background">
          Local chains · dev wallets · nothing here is real
        </div>
      )}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link to="/" className="font-display text-3xl font-bold italic tracking-tighter sm:text-4xl">
          Mandate
        </Link>
        <div className="hidden items-center gap-8 md:flex">{LINKS.map(link)}</div>
        <div className="flex items-center gap-3">
          <WalletButton />
          <button
            className="flex size-12 items-center justify-center border-2 border-foreground md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-5 border-t border-foreground/15 px-4 py-5 md:hidden">{LINKS.map(link)}</div>
      )}
    </nav>
  )
}
