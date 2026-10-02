import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Page } from '@/components/Layout'
import { ButtonLink, PageHeader, Skeleton } from '@/components/ui'
import { ErrorNotice, Notice, RequireDeployment } from '@/components/States'
import { ProfileCard } from '@/components/profile'
import { useDirectory, useMyProfile } from '@/hooks/useDirectory'
import { compare, type Match } from '@/lib/matching'
import { otherRole, type Profile, type Role } from '@/lib/profile'
import { cn } from '@/lib/utils'

export default function MarketPage() {
  return (
    <Page>
      <PageHeader eyebrow="Market · read live from ENS" title="The market">
        Every borrower and lender on Mandate, straight from their ENS records. With a profile of your own, each
        counterpart is scored against your criteria.
      </PageHeader>
      <RequireDeployment need="registry">
        <Market />
      </RequireDeployment>
    </Page>
  )
}

function Market() {
  const [params, setParams] = useSearchParams()
  const myBorrower = useMyProfile('borrower').profile
  const myLender = useMyProfile('lender').profile
  const defaultView: Role = myLender && !myBorrower ? 'borrower' : 'lender'
  const view = (params.get('view') === 'borrowers' ? 'borrower' : params.get('view') === 'lenders' ? 'lender' : defaultView) as Role
  const [query, setQuery] = useState('')
  const [fitsOnly, setFitsOnly] = useState(false)

  const directory = useDirectory(view)
  // Who I'd be matched as when looking at this side of the market.
  const me = view === 'lender' ? myBorrower : myLender

  const rows = useMemo(() => {
    const list = (directory.data ?? []).filter((p) => !me || p.account !== me.account)
    const q = query.trim().toLowerCase()
    const scored: { profile: Profile; match?: Match }[] = list
      .filter(
        (p) =>
          !q ||
          [p.label, p.records.display, p.records.description, p.records.industry, p.records.location, p.records.loanType]
            .join(' ')
            .toLowerCase()
            .includes(q),
      )
      .map((profile) => ({
        profile,
        match: me ? (view === 'lender' ? compare(me.records, profile.records) : compare(profile.records, me.records)) : undefined,
      }))
    if (me) scored.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
    return fitsOnly && me ? scored.filter((r) => r.match && (r.match.tier === 'Strong' || r.match.tier === 'Good')) : scored
  }, [directory.data, me, query, fitsOnly, view])

  const setView = (r: Role) => setParams(r === 'lender' ? { view: 'lenders' } : { view: 'borrowers' }, { replace: true })

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex border-2 border-foreground" role="tablist">
          {(['lender', 'borrower'] as Role[]).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={view === r}
              onClick={() => setView(r)}
              className={cn(
                'h-12 flex-1 px-6 font-mono text-xs uppercase tracking-[0.16em] sm:flex-none',
                view === r ? 'bg-foreground text-background' : 'hover:bg-muted',
              )}
            >
              {r}s
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {me && (
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em]">
              <input
                type="checkbox"
                checked={fitsOnly}
                onChange={(e) => setFitsOnly(e.target.checked)}
                className="size-4 accent-foreground"
              />
              Good fits only
            </label>
          )}
          <label className="flex h-12 items-center gap-2 border-2 border-foreground px-3 sm:w-72">
            <Search className="size-4 shrink-0" />
            <span className="sr-only">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, sector, region"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </label>
        </div>
      </div>

      {!me && (
        <div className="mb-8">
          <Notice
            title={`See how ${view}s fit you`}
            action={
              <ButtonLink to={`/${otherRole(view)}`} size="sm">
                Create a {otherRole(view)} profile
              </ButtonLink>
            }
          >
            With a {otherRole(view)} profile, Mandate scores every {view} against your amount, rate, term, loan type,
            industry and region, and ranks the best fits first.
          </Notice>
        </div>
      )}

      {directory.isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : directory.error ? (
        <ErrorNotice error={directory.error} retry={directory.refetch} />
      ) : rows.length === 0 ? (
        <Notice title={query || fitsOnly ? 'Nothing matches that' : `No ${view}s yet`}>
          {query || fitsOnly
            ? 'Try a broader search, or show every profile.'
            : `Be the first: profiles are ENS names under ${view === 'lender' ? 'lenderlist' : 'borrowerlist'}.n4vnt.eth.`}
        </Notice>
      ) : (
        <>
          <p className="eyebrow mb-4">
            {rows.length} {view}
            {rows.length === 1 ? '' : 's'}
            {me ? ` · ranked for ${me.records.display || me.label}` : ''}
          </p>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rows.map(({ profile, match }) => (
              <ProfileCard key={profile.node} profile={profile} match={match} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
