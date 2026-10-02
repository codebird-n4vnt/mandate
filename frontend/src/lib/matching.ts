import { ANY, FIELD, ROI_BANDS, roiLowerBound, roiUpperBound, type FieldKey, type Records } from './profile'

export interface Criterion {
  key: FieldKey
  label: string
  met: boolean
  borrower: string
  lender: string
  /** Why it did or didn't match, in plain words. */
  reason: string
}

export type MatchTier = 'Strong' | 'Good' | 'Partial' | 'Weak'

export interface Match {
  criteria: Criterion[]
  met: number
  total: number
  /** 0..1 */
  score: number
  tier: MatchTier
}

const CRITERIA: FieldKey[] = ['amount', 'roi', 'tenure', 'loanType', 'industry', 'location']

const num = (s: string) => {
  const n = Number(s.replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : undefined
}

const bandIndex = (band: string) => ROI_BANDS.indexOf(band as (typeof ROI_BANDS)[number])

function check(key: FieldKey, borrower: string, lender: string): { met: boolean; reason: string } {
  if (!borrower || !lender) return { met: false, reason: 'Not stated by both sides' }
  switch (key) {
    case 'amount': {
      const b = num(borrower)
      const l = num(lender)
      if (b === undefined || l === undefined) return { met: false, reason: 'Not stated by both sides' }
      return b <= l
        ? { met: true, reason: 'Within the lender’s ticket size' }
        : { met: false, reason: 'More than the lender’s largest loan' }
    }
    case 'roi': {
      const b = bandIndex(borrower)
      const l = bandIndex(lender)
      if (b < 0 || l < 0) return { met: false, reason: 'Unknown rate band' }
      if (l <= b) return { met: true, reason: b === l ? 'Same rate band' : 'Borrower can pay what the lender asks' }
      return { met: false, reason: 'Lender asks for more than the borrower can pay' }
    }
    case 'tenure': {
      const b = num(borrower)
      const l = num(lender)
      if (b === undefined || l === undefined) return { met: false, reason: 'Not stated by both sides' }
      return b <= l
        ? { met: true, reason: 'Within the lender’s longest term' }
        : { met: false, reason: 'Longer than the lender lends for' }
    }
    default:
      if (lender === ANY) return { met: true, reason: 'Lender is open to any' }
      return borrower === lender ? { met: true, reason: 'Same' } : { met: false, reason: 'Different' }
  }
}

/** How well a borrower's profile fits a lender's, criterion by criterion. */
export function compare(borrower: Records, lender: Records): Match {
  const criteria = CRITERIA.map((key) => {
    const b = borrower[key]?.trim() ?? ''
    const l = lender[key]?.trim() ?? ''
    return { key, label: FIELD[key].label.borrower.replace(/ \(.*\)$/, ''), borrower: b, lender: l, ...check(key, b, l) }
  })
  const met = criteria.filter((c) => c.met).length
  const total = criteria.length
  const tier: MatchTier = met === total ? 'Strong' : met >= total - 2 ? 'Good' : met >= 2 ? 'Partial' : 'Weak'
  return { criteria, met, total, score: met / total, tier }
}

/** Starting terms for an offer: what both sides asked for, in the overlap where there is one. */
export function suggestedTerms(borrower: Records, lender: Records) {
  const want = num(borrower.amount ?? '')
  const max = num(lender.amount ?? '')
  const amount = want !== undefined && max !== undefined ? Math.min(want, max) : (want ?? max ?? 0)

  // Middle of the overlap between the lender's band and the borrower's band.
  const lo = Math.max(roiLowerBound(lender.roi ?? ''), roiLowerBound(borrower.roi ?? ''))
  const hi = Math.min(roiUpperBound(lender.roi ?? '') || Infinity, roiUpperBound(borrower.roi ?? '') || Infinity)
  const apr = Number.isFinite(hi) && hi >= lo ? (lo + hi) / 2 : lo || 12

  const months = num(borrower.tenure ?? '') ?? num(lender.tenure ?? '') ?? 12
  return { amount, apr, months }
}
