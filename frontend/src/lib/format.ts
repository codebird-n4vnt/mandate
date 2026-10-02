import { formatUnits, parseUnits } from 'viem'
import { USDC_DECIMALS } from '@/config/contracts'

const usd = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const usdCompact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

/** 150000000000n -> "150,000.00" */
export function formatUsdc(amount: bigint, opts: { compact?: boolean } = {}) {
  const value = Number(formatUnits(amount, USDC_DECIMALS))
  return opts.compact ? usdCompact.format(value) : usd.format(value)
}

/** A whole-number USDC string from a profile record, e.g. "250000" -> "250,000". */
export function formatWholeUsdc(value: string) {
  const n = Number(value)
  return Number.isFinite(n) && value !== '' ? n.toLocaleString('en-US') : value
}

/** "1,500.25" -> 1500250000n; undefined if not a positive amount with at most 6 decimals. */
export function parseUsdc(input: string): bigint | undefined {
  const clean = input.replace(/,/g, '').trim()
  if (!/^\d+(\.\d{0,6})?$/.test(clean)) return undefined
  const value = parseUnits(clean, USDC_DECIMALS)
  return value > 0n ? value : undefined
}

/** 1200 -> "12%", 1650 -> "16.5%" */
export function formatBps(bps: number) {
  return `${Number((bps / 100).toFixed(2))}%`
}

/** "12.5" -> 1250; undefined if not between 0 and 100. */
export function parseAprPercent(input: string): number | undefined {
  const n = Number(input)
  if (!Number.isFinite(n) || n < 0 || n > 100 || input.trim() === '') return undefined
  return Math.round(n * 100)
}

/** Months as shown in the UI -> days as stored on-chain (365-day year). */
export function monthsToDays(months: number) {
  return Math.round((months * 365) / 12)
}

/** 730 -> "24 months", 183 -> "6 months", 45 -> "45 days" */
export function formatTerm(days: number) {
  const months = (days * 12) / 365
  if (Math.abs(months - Math.round(months)) < 0.05 && Math.round(months) > 0) {
    const m = Math.round(months)
    return `${m} month${m === 1 ? '' : 's'}`
  }
  return `${days} day${days === 1 ? '' : 's'}`
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDate(seconds: number | bigint) {
  return dateFmt.format(new Date(Number(seconds) * 1000))
}

/** "in 3 days", "5 days ago", "today" */
export function formatRelative(seconds: number | bigint, now = Date.now() / 1000) {
  const days = Math.round((Number(seconds) - now) / 86_400)
  if (days === 0) return 'today'
  return days > 0 ? `in ${days} day${days === 1 ? '' : 's'}` : `${-days} day${days === -1 ? '' : 's'} ago`
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
