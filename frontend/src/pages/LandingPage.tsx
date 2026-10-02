import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useDirectory } from '@/hooks/useDirectory'
import { useLoanStats } from '@/hooks/useLoans'
import { formatUsdc } from '@/lib/format'
import { ROOT_NAMES } from '@/config/contracts'

function Stat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-foreground px-6 py-8 sm:border-r-2 sm:last:border-r-0">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-4xl tabular md:text-5xl">{value ?? '—'}</p>
    </div>
  )
}

const STEPS = [
  {
    n: '01',
    title: 'Publish your intent',
    body: `Borrowers and lenders each claim a name like acme.${ROOT_NAMES.borrower}. What you need or offer (amount, rate, term, sector, region) is stored in its ENS text records: public, portable, and yours.`,
  },
  {
    n: '02',
    title: 'Get matched',
    body: 'Mandate reads every profile straight from the chain and scores each borrower against each lender on six criteria. No database, no gatekeeper.',
  },
  {
    n: '03',
    title: 'Lend and repay in USDC',
    body: 'A lender escrows an offer in USDC on Arc. The borrower accepts after off-chain diligence and receives the funds at once, then repays on-chain, building a public track record.',
  },
]

export default function LandingPage() {
  const borrowers = useDirectory('borrower')
  const lenders = useDirectory('lender')
  const stats = useLoanStats()

  return (
    <>
      <section className="border-b-4 border-foreground">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
          <div className="flex flex-[1.2] flex-col justify-center border-b-4 border-foreground px-4 py-14 sm:px-6 md:py-20 lg:border-r-4 lg:border-b-0 lg:px-10 lg:py-28">
            <h1 className="font-display text-6xl leading-[0.85] tracking-tighter sm:text-7xl md:text-8xl xl:text-9xl">
              Onchain <br />
              <span className="italic">credit,</span> <br />
              matched <br /> & settled.
            </h1>
            <p className="mt-10 max-w-md border-l-2 border-foreground pl-6 text-xl leading-relaxed text-foreground/80 md:text-2xl">
              Lending intents live in ENS. Loans are offered, accepted and repaid in USDC on Arc.
            </p>
          </div>

          <div className="flex flex-1 flex-col">
            {[
              { to: '/lender', role: 'Lender', note: 'Escrow offers to borrowers that fit your mandate.' },
              { to: '/borrower', role: 'Borrower', note: 'Publish what you need and receive funded offers.' },
            ].map((c, i) => (
              <Link
                key={c.to}
                to={c.to}
                className={`group flex flex-1 items-start justify-between gap-6 p-8 transition-colors duration-100 hover:bg-foreground hover:text-background md:p-12 ${i === 0 ? 'border-b-2 border-foreground' : ''}`}
              >
                <div>
                  <span className="eyebrow group-hover:text-background/70">Enter the market as</span>
                  <h2 className="mt-3 font-display text-5xl italic md:text-6xl">{c.role}</h2>
                  <p className="mt-4 max-w-xs text-base opacity-70">{c.note}</p>
                </div>
                <ArrowRight
                  className="size-12 shrink-0 -rotate-45 transition-transform duration-300 group-hover:rotate-0"
                  strokeWidth={0.75}
                />
              </Link>
            ))}
            <Link
              to="/market"
              className="flex items-center justify-between border-t-4 border-foreground bg-paper px-8 py-6 font-mono text-xs uppercase tracking-[0.18em] hover:bg-foreground hover:text-background md:px-12"
            >
              Browse the market <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-foreground bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
          <Stat label="Borrowers" value={borrowers.data?.length.toString()} />
          <Stat label="Lenders" value={lenders.data?.length.toString()} />
          <Stat label="USDC lent" value={stats.data ? formatUsdc(stats.data.originated, { compact: true }) : undefined} />
          <Stat label="USDC repaid" value={stats.data ? formatUsdc(stats.data.repaid, { compact: true }) : undefined} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <p className="eyebrow mb-4">How it works</p>
        <h2 className="max-w-3xl font-display text-5xl leading-none tracking-tight md:text-6xl">
          Three steps, all <span className="italic">on-chain.</span>
        </h2>
        <ol className="mt-14 grid gap-0 border-t-2 border-foreground md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="border-b-2 border-foreground py-8 md:border-r-2 md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0">
              <span className="font-mono text-sm">{s.n}</span>
              <h3 className="mt-4 font-display text-3xl">{s.title}</h3>
              <p className="mt-4 leading-relaxed text-foreground/80">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y-2 border-foreground bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">Why ENS</p>
            <p className="mt-4 font-display text-3xl leading-snug">
              A profile is a name you own, not a row in our database. Any app can read it, and you can take it with
              you.
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/60">Why Arc</p>
            <p className="mt-4 font-display text-3xl leading-snug">
              Circle’s stablecoin chain settles in USDC, and gas is USDC too, so lenders and borrowers only ever hold
              dollars.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
