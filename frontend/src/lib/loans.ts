import type { Address } from 'viem'

/** MandateLoans.Status */
export const STATUS = ['Offered', 'Active', 'Repaid', 'Cancelled', 'Declined'] as const
export type LoanStatus = (typeof STATUS)[number]

export interface Loan {
  id: bigint
  lender: Address
  borrower: Address
  principal: bigint
  repaid: bigint
  aprBps: number
  feeBps: number
  termDays: number
  offeredAt: number
  startedAt: number
  status: LoanStatus
  // derived
  interest: bigint
  amountDue: bigint
  outstanding: bigint
  fee: bigint
  /** Unix seconds; 0 until the loan starts. */
  dueAt: number
}

const BPS = 10_000n
const DAYS_PER_YEAR = 365n

/** Same arithmetic as MandateLoans.interestFor (simple interest, rounded down). */
export function interestFor(principal: bigint, aprBps: number, termDays: number) {
  return (principal * BigInt(aprBps) * BigInt(termDays)) / (BPS * DAYS_PER_YEAR)
}

export function feeFor(principal: bigint, feeBps: number) {
  return (principal * BigInt(feeBps)) / BPS
}

type RawLoan = {
  lender: Address
  borrower: Address
  principal: bigint
  repaid: bigint
  aprBps: number
  feeBps: number
  termDays: number
  offeredAt: bigint
  startedAt: bigint
  status: number
}

export function toLoan(id: bigint, raw: RawLoan): Loan {
  const interest = interestFor(raw.principal, raw.aprBps, raw.termDays)
  const amountDue = raw.principal + interest
  const status = STATUS[raw.status] ?? 'Offered'
  const startedAt = Number(raw.startedAt)
  return {
    id,
    lender: raw.lender,
    borrower: raw.borrower,
    principal: raw.principal,
    repaid: raw.repaid,
    aprBps: raw.aprBps,
    feeBps: raw.feeBps,
    termDays: raw.termDays,
    offeredAt: Number(raw.offeredAt),
    startedAt,
    status,
    interest,
    amountDue,
    outstanding: status === 'Active' ? amountDue - raw.repaid : 0n,
    fee: feeFor(raw.principal, raw.feeBps),
    dueAt: startedAt === 0 ? 0 : startedAt + raw.termDays * 86_400,
  }
}

export function isOverdue(loan: Loan, now = Date.now() / 1000) {
  return loan.status === 'Active' && loan.dueAt > 0 && now > loan.dueAt
}

/** What to call a loan's state in the UI. */
export function statusLabel(loan: Loan): string {
  if (isOverdue(loan)) return 'Overdue'
  switch (loan.status) {
    case 'Offered':
      return 'Awaiting borrower'
    case 'Active':
      return 'Active'
    case 'Repaid':
      return 'Repaid'
    case 'Cancelled':
      return 'Withdrawn'
    case 'Declined':
      return 'Declined'
  }
}
