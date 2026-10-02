import { useMemo, useState, type FormEvent } from 'react'
import { useConfig, useReadContract } from 'wagmi'
import { writeContract } from 'wagmi/actions'
import { encodeFunctionData } from 'viem'
import { Check, X } from 'lucide-react'
import { Page } from '@/components/Layout'
import { Button, ButtonLink, Field, Input, PageHeader, Select, Skeleton, Textarea } from '@/components/ui'
import { ErrorNotice, Notice, RequireDeployment, RequireWallet } from '@/components/States'
import { EnsName } from '@/components/profile'
import { TxSteps } from '@/components/TxSteps'
import { FAUCETS, sepolia } from '@/config/chains'
import { REGISTRY_ADDRESS, ROOT_NAMES } from '@/config/contracts'
import { registryAbi } from '@/abi/registry'
import { resolverAbi } from '@/abi/ens'
import { useMyProfile } from '@/hooks/useDirectory'
import { useDebounced } from '@/hooks/useDebounced'
import { useTxFlow } from '@/hooks/useTxFlow'
import { useGas } from '@/hooks/useUsdc'
import {
  FIELDS,
  ROLE_INDEX,
  changedRecords,
  emptyRecords,
  labelProblem,
  missingFields,
  optionsFor,
  otherRole,
  profileName,
  suggestLabel,
  toTextRecords,
  type FieldKey,
  type Profile,
  type Records,
  type Role,
} from '@/lib/profile'

const COPY: Record<Role, { title: string; intro: string; why: string }> = {
  borrower: {
    title: 'Borrow',
    intro:
      'Tell lenders what you need. Your profile is an ENS name you own, and lenders whose criteria fit will see you first.',
    why: 'Your wallet owns your borrower profile and receives the USDC when you accept an offer.',
  },
  lender: {
    title: 'Lend',
    intro:
      'Describe the loans you make. Borrowers who fit your mandate are ranked for you, and you can send them a funded offer.',
    why: 'Your wallet owns your lender profile and funds the offers you make.',
  },
}

export default function ProfilePage({ role }: { role: Role }) {
  return (
    <Page>
      <PageHeader eyebrow={`${role} profile · ENS on Sepolia`} title={COPY[role].title}>
        {COPY[role].intro}
      </PageHeader>
      <RequireDeployment need="registry">
        <RequireWallet why={COPY[role].why}>
          <ProfileEditor role={role} />
        </RequireWallet>
      </RequireDeployment>
    </Page>
  )
}

function ProfileEditor({ role }: { role: Role }) {
  const { profile, isLoading, error, refetch } = useMyProfile(role)
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (error) return <ErrorNotice error={error} retry={refetch} />
  return profile ? <EditProfile key={profile.node} profile={profile} /> : <CreateProfile role={role} />
}

// ---------------------------------------------------------------- shared fields

function ProfileFields({
  role,
  records,
  onChange,
  showErrors,
}: {
  role: Role
  records: Records
  onChange: (key: FieldKey, value: string) => void
  showErrors: boolean
}) {
  return (
    <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      {FIELDS.map((f) => {
        const id = `field-${f.key}`
        const missing = showErrors && f.required && !records[f.key]?.trim()
        const error = missing ? 'Required' : null
        const common = { id, 'aria-invalid': missing || undefined }
        return (
          <Field
            key={f.key}
            label={f.label[role]}
            hint={f.hint?.[role]}
            error={error}
            htmlFor={id}
            className={f.kind === 'textarea' ? 'md:col-span-2' : undefined}
          >
            {f.kind === 'select' ? (
              <Select
                {...common}
                options={optionsFor(f, role)}
                value={records[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            ) : f.kind === 'textarea' ? (
              <Textarea
                {...common}
                maxLength={280}
                value={records[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            ) : f.kind === 'amount' ? (
              <Input
                {...common}
                inputMode="numeric"
                placeholder="100000"
                value={records[f.key]}
                onChange={(e) => onChange(f.key, e.target.value.replace(/[^\d]/g, '').replace(/^0+/, ''))}
              />
            ) : (
              <Input
                {...common}
                maxLength={64}
                value={records[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
              />
            )}
          </Field>
        )
      })}
    </div>
  )
}

function GasNotice() {
  const gas = useGas()
  if (gas[sepolia.id] !== 0n) return null
  return (
    <Notice
      title="You’ll need a little Sepolia ETH"
      action={
        <a className="font-mono text-xs underline" href={FAUCETS[sepolia.id].url} target="_blank" rel="noreferrer">
          {FAUCETS[sepolia.id].label} ↗
        </a>
      }
    >
      Profiles are ENS names on Ethereum Sepolia, so publishing or editing one costs a small amount of test ETH.
    </Notice>
  )
}

// ---------------------------------------------------------------- create

function CreateProfile({ role }: { role: Role }) {
  const config = useConfig()
  const flow = useTxFlow()
  const [records, setRecords] = useState<Records>(emptyRecords)
  const [label, setLabel] = useState('')
  const [labelEdited, setLabelEdited] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const effectiveLabel = labelEdited ? label : suggestLabel(records.display)
  const problem = effectiveLabel ? labelProblem(effectiveLabel) : 'Pick a name.'
  const debounced = useDebounced(effectiveLabel)
  const availability = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: 'isAvailable',
    args: [ROLE_INDEX[role], debounced],
    chainId: sepolia.id,
    query: { enabled: Boolean(REGISTRY_ADDRESS && debounced && !labelProblem(debounced)) },
  })
  const checking = debounced !== effectiveLabel || availability.isFetching
  const available = !problem && !checking && availability.data === true
  const taken = !problem && !checking && availability.data === false

  const missing = missingFields(records)
  const set = (key: FieldKey, value: string) => setRecords((r) => ({ ...r, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (missing.length || problem || taken) return
    const { keys, values } = toTextRecords(records)
    await flow.run(
      [
        {
          label: `Register ${profileName(role, effectiveLabel)}`,
          chainId: sepolia.id,
          send: () =>
            writeContract(config, {
              address: REGISTRY_ADDRESS!,
              abi: registryAbi,
              functionName: 'register',
              args: [ROLE_INDEX[role], effectiveLabel, keys, values],
              chainId: sepolia.id,
            }),
        },
      ],
      { title: 'Your profile is live', body: profileName(role, effectiveLabel) },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-12">
      <GasNotice />
      <section className="border-2 border-foreground p-6 md:p-10">
        <h2 className="font-display text-3xl">Your profile</h2>
        <p className="mt-2 text-muted-foreground">Everything here is public and stored on-chain as ENS text records.</p>
        <div className="mt-10">
          <ProfileFields role={role} records={records} onChange={set} showErrors={submitted} />
        </div>
      </section>

      <section className="border-2 border-foreground p-6 md:p-10">
        <h2 className="font-display text-3xl">Your ENS name</h2>
        <p className="mt-2 text-muted-foreground">
          Counterparties will find you as <span className="font-mono text-sm">name.{ROOT_NAMES[role]}</span>. It points
          to your wallet, and you own it.
        </p>
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end">
          <Field label="Name" htmlFor="label" className="flex-1" error={submitted || label ? (taken ? 'Taken' : effectiveLabel ? problem : null) : null}>
            <div className="flex items-baseline gap-2">
              <Input
                id="label"
                value={effectiveLabel}
                placeholder="acme"
                autoCapitalize="none"
                spellCheck={false}
                onChange={(e) => {
                  setLabelEdited(true)
                  setLabel(e.target.value.toLowerCase())
                }}
                className="font-mono"
              />
              <span className="shrink-0 font-mono text-sm text-muted-foreground">.{ROOT_NAMES[role]}</span>
            </div>
          </Field>
          <div className="h-10 font-mono text-xs md:w-40">
            {effectiveLabel && !problem && checking && <span className="text-muted-foreground">Checking…</span>}
            {available && (
              <span className="flex items-center gap-1 text-ok">
                <Check className="size-4" /> Available
              </span>
            )}
            {taken && (
              <span className="flex items-center gap-1 text-alert">
                <X className="size-4" /> Taken
              </span>
            )}
          </div>
        </div>
      </section>

      {submitted && missing.length > 0 && (
        <p className="font-mono text-sm text-alert" role="alert">
          Fill in: {missing.map((f) => f.label[role]).join(', ')}.
        </p>
      )}

      <div>
        <Button type="submit" size="lg" className="w-full md:w-auto" loading={flow.running}>
          Publish profile
        </Button>
        <p className="mt-3 text-sm text-muted-foreground">One transaction on Sepolia creates the name and its records.</p>
        <TxSteps steps={flow.steps} error={flow.error} />
      </div>
    </form>
  )
}

// ---------------------------------------------------------------- edit

function EditProfile({ profile }: { profile: Profile }) {
  const config = useConfig()
  const flow = useTxFlow()
  const role = profile.role
  const [records, setRecords] = useState<Records>(profile.records)
  const [submitted, setSubmitted] = useState(false)
  const resolver = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: 'resolver',
    chainId: sepolia.id,
  })

  const changes = useMemo(() => changedRecords(profile.records, records), [profile.records, records])
  const missing = missingFields(records)
  const set = (key: FieldKey, value: string) => setRecords((r) => ({ ...r, [key]: value }))

  const save = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (missing.length || changes.length === 0 || !resolver.data) return
    const calls = changes.map((c) =>
      encodeFunctionData({ abi: resolverAbi, functionName: 'setText', args: [profile.node, c.key, c.value] }),
    )
    await flow.run(
      [
        {
          label: `Update ${changes.length} record${changes.length === 1 ? '' : 's'}`,
          chainId: sepolia.id,
          send: () =>
            writeContract(config, {
              address: resolver.data!,
              abi: resolverAbi,
              functionName: 'multicall',
              args: [calls],
              chainId: sepolia.id,
            }),
        },
      ],
      { title: 'Profile updated', body: profile.name },
    )
  }

  return (
    <div className="space-y-12">
      <section className="grid gap-6 border-2 border-foreground bg-paper p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="min-w-0">
          <p className="eyebrow">Your {role} profile</p>
          <p className="mt-2 font-display text-3xl">{profile.records.display || profile.label}</p>
          <EnsName profile={profile} className="mt-2 inline-block" />
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/market" variant="primary">
            See matching {otherRole(role)}s
          </ButtonLink>
          <ButtonLink to={`/p/${role}/${profile.label}`} variant="secondary">
            Public view
          </ButtonLink>
        </div>
      </section>

      <form onSubmit={save} noValidate className="space-y-10">
        <GasNotice />
        <section className="border-2 border-foreground p-6 md:p-10">
          <h2 className="font-display text-3xl">Edit</h2>
          <p className="mt-2 text-muted-foreground">Only the records you change are written.</p>
          <div className="mt-10">
            <ProfileFields role={role} records={records} onChange={set} showErrors={submitted} />
          </div>
        </section>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={changes.length === 0 || !resolver.data} loading={flow.running}>
            {changes.length === 0 ? 'No changes' : `Save ${changes.length} change${changes.length === 1 ? '' : 's'}`}
          </Button>
          {changes.length > 0 && (
            <Button variant="ghost" onClick={() => setRecords(profile.records)} disabled={flow.running}>
              Discard
            </Button>
          )}
        </div>
        <TxSteps steps={flow.steps} error={flow.error} />
      </form>
    </div>
  )
}
