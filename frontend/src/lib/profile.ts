import { labelhash, namehash, type Address, type Hex } from 'viem'
import { ROOT_NAMES } from '@/config/contracts'

export type Role = 'borrower' | 'lender'

/** MandateRegistry.Role */
export const ROLE_INDEX = { borrower: 0, lender: 1 } as const

export const otherRole = (role: Role): Role => (role === 'borrower' ? 'lender' : 'borrower')

export const ANY = 'Any'

export const ROI_BANDS = ['5-10', '10-15', '15-20', '20+'] as const
export const LOAN_TYPES = ['Personal', 'Business', 'Education', 'Mortgage'] as const
export const TENURES = ['6', '12', '18', '24', '36', '48'] as const
export const LOCATIONS = [
  'India',
  'USA',
  'UAE',
  'Singapore',
  'United Kingdom',
  'Europe',
  'Australia',
  'Japan',
  'China',
  'Argentina',
] as const
export const INDUSTRIES = [
  'Agriculture & Allied Industries',
  'Automobiles & Auto Components',
  'Aviation & Aerospace',
  'Banking, Financial Services & FinTech',
  'Construction, Real Estate & Infrastructure',
  'Consumer Goods (FMCG, D2C, Retail)',
  'E-commerce & Marketplaces',
  'Food, Beverage & Hospitality',
  'Healthcare & Pharma',
  'Education & EdTech',
  'Energy & Renewables',
  'IT Services & SaaS',
  'AI, Data & Cloud',
  'Cybersecurity',
  'Logistics & Supply Chain',
  'Manufacturing & Industrial',
  'Media, Gaming & Entertainment',
  'Telecom',
  'Web3, Blockchain & Crypto',
  'Electronics, Hardware & IoT',
] as const

export type FieldKey = 'display' | 'description' | 'amount' | 'roi' | 'tenure' | 'loanType' | 'industry' | 'location'

export interface FieldDef {
  key: FieldKey
  /** The ENS text record key. `display`, `description` and `location` are ENSIP-5 global keys. */
  record: string
  kind: 'text' | 'textarea' | 'amount' | 'select'
  label: Record<Role, string>
  hint?: Record<Role, string>
  options?: readonly string[]
  /** Lenders may accept any value. */
  allowAny?: boolean
  required?: boolean
}

export const FIELDS: FieldDef[] = [
  {
    key: 'display',
    record: 'display',
    kind: 'text',
    label: { borrower: 'Company or name', lender: 'Fund or name' },
    required: true,
  },
  {
    key: 'description',
    record: 'description',
    kind: 'textarea',
    label: { borrower: 'What the money is for', lender: 'What you lend to' },
    hint: {
      borrower: 'One or two lines lenders will see first.',
      lender: 'One or two lines borrowers will see first.',
    },
  },
  {
    key: 'amount',
    record: 'mandate.amount',
    kind: 'amount',
    label: { borrower: 'Amount needed (USDC)', lender: 'Largest loan you make (USDC)' },
    required: true,
  },
  {
    key: 'roi',
    record: 'mandate.roi',
    kind: 'select',
    options: ROI_BANDS,
    label: { borrower: 'Interest you can pay (% APR)', lender: 'Return you look for (% APR)' },
    required: true,
  },
  {
    key: 'tenure',
    record: 'mandate.tenure',
    kind: 'select',
    options: TENURES,
    label: { borrower: 'Term (months)', lender: 'Longest term (months)' },
    required: true,
  },
  {
    key: 'loanType',
    record: 'mandate.loanType',
    kind: 'select',
    options: LOAN_TYPES,
    allowAny: true,
    label: { borrower: 'Loan type', lender: 'Loan types' },
    required: true,
  },
  {
    key: 'industry',
    record: 'mandate.industry',
    kind: 'select',
    options: INDUSTRIES,
    allowAny: true,
    label: { borrower: 'Industry', lender: 'Industries' },
    required: true,
  },
  {
    key: 'location',
    record: 'location',
    kind: 'select',
    options: LOCATIONS,
    allowAny: true,
    label: { borrower: 'Location', lender: 'Regions' },
    required: true,
  },
]

export const FIELD = Object.fromEntries(FIELDS.map((f) => [f.key, f])) as Record<FieldKey, FieldDef>

export type Records = Record<FieldKey, string>

export const emptyRecords = (): Records =>
  Object.fromEntries(FIELDS.map((f) => [f.key, ''])) as Records

export function optionsFor(field: FieldDef, role: Role): readonly string[] {
  const options = field.options ?? []
  return role === 'lender' && field.allowAny ? [ANY, ...options] : options
}

export interface Profile {
  role: Role
  label: string
  /** Full ENS name, e.g. `acme.borrowerlist.n4vnt.eth`. */
  name: string
  node: Hex
  account: Address
  records: Records
}

export function profileName(role: Role, label: string) {
  return `${label}.${ROOT_NAMES[role]}`
}

export function profileNode(role: Role, label: string): Hex {
  return namehash(profileName(role, label))
}

export { labelhash }

// ---------------------------------------------------------------- labels

export const LABEL_MIN = 3
export const LABEL_MAX = 32

/** Mirrors MandateRegistry.isValidLabel. Returns a reason, or null when valid. */
export function labelProblem(label: string): string | null {
  if (label.length < LABEL_MIN) return `At least ${LABEL_MIN} characters.`
  if (label.length > LABEL_MAX) return `At most ${LABEL_MAX} characters.`
  if (!/^[a-z0-9-]+$/.test(label)) return 'Use lowercase letters, numbers and hyphens only.'
  if (label.startsWith('-') || label.endsWith('-')) return "Can't start or end with a hyphen."
  if (label.length >= 4 && label[2] === '-' && label[3] === '-') return "Can't have hyphens in both the 3rd and 4th place."
  return null
}

/** Turns "Acme Robotics Pvt. Ltd" into "acme-robotics-pvt-ltd". */
export function suggestLabel(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LABEL_MAX)
    .replace(/-+$/, '')
}

// ---------------------------------------------------------------- records

/** Which records still need a value before the profile can be published. */
export function missingFields(records: Records): FieldDef[] {
  return FIELDS.filter((f) => f.required && !records[f.key]?.trim())
}

/** The text records to write, as parallel key/value arrays (blank values are skipped). */
export function toTextRecords(records: Records): { keys: string[]; values: string[] } {
  const keys: string[] = []
  const values: string[] = []
  for (const f of FIELDS) {
    const value = records[f.key]?.trim() ?? ''
    if (!value) continue
    keys.push(f.record)
    values.push(value)
  }
  return { keys, values }
}

/** Only the records that differ from what is on-chain (to keep edits cheap). */
export function changedRecords(before: Records, after: Records): { key: string; value: string }[] {
  return FIELDS.filter((f) => (before[f.key] ?? '').trim() !== (after[f.key] ?? '').trim()).map((f) => ({
    key: f.record,
    value: (after[f.key] ?? '').trim(),
  }))
}

/** Turns "10-15" into 10 and "20+" into 20. */
export function roiLowerBound(band: string): number {
  const n = parseFloat(band)
  return Number.isFinite(n) ? n : 0
}

/** Turns "10-15" into 15 and "20+" into 25. */
export function roiUpperBound(band: string): number {
  if (band.endsWith('+')) return roiLowerBound(band) + 5
  const [, hi] = band.split('-')
  const n = parseFloat(hi)
  return Number.isFinite(n) ? n : 0
}
