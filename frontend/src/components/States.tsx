import { useState, type ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { TriangleAlert } from 'lucide-react'
import { LOANS_ADDRESS, REGISTRY_ADDRESS } from '@/config/contracts'
import { describeError } from '@/lib/errors'
import { ConnectModal } from './WalletButton'
import { Button } from './ui'

export function Notice({
  title,
  children,
  action,
  tone = 'default',
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
  tone?: 'default' | 'alert'
}) {
  return (
    <div
      className={
        tone === 'alert'
          ? 'border-2 border-alert bg-alert/5 p-6 md:p-8'
          : 'border-2 border-dashed border-foreground/40 bg-paper p-6 md:p-8'
      }
    >
      <h2 className="font-display text-2xl italic md:text-3xl">{title}</h2>
      {children && <div className="mt-3 max-w-2xl leading-relaxed text-foreground/80">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
    </div>
  )
}

export function ErrorNotice({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <Notice
      tone="alert"
      title="Couldn’t load this from the chain"
      action={
        retry && (
          <Button variant="secondary" size="sm" onClick={retry}>
            Try again
          </Button>
        )
      }
    >
      <p className="flex items-start gap-2 font-mono text-sm">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-alert" /> {describeError(error)}
      </p>
    </Notice>
  )
}

/** Shows a connect prompt instead of `children` until a wallet is connected. */
export function RequireWallet({ children, why }: { children: ReactNode; why: string }) {
  const { address, status } = useConnection()
  const [open, setOpen] = useState(false)
  if (address) return <>{children}</>
  return (
    <>
      <Notice
        title="Connect a wallet to continue"
        action={
          <Button onClick={() => setOpen(true)} loading={status === 'reconnecting' || status === 'connecting'}>
            Connect wallet
          </Button>
        }
      >
        {why}
      </Notice>
      <ConnectModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

/** Shown when the app is built without contract addresses for the network it needs. */
export function RequireDeployment({ need, children }: { need: 'registry' | 'loans'; children: ReactNode }) {
  const deployed = need === 'registry' ? REGISTRY_ADDRESS : LOANS_ADDRESS
  if (deployed) return <>{children}</>
  return (
    <Notice title={need === 'registry' ? 'The profile registry isn’t deployed yet' : 'The loan book isn’t deployed yet'}>
      {need === 'registry' ? 'MandateRegistry (Sepolia)' : 'MandateLoans (Arc testnet)'} has no address in{' '}
      <code className="font-mono text-sm">contract/deployments</code>. Deploy it with the Foundry scripts described in
      the README, or run everything locally with <code className="font-mono text-sm">scripts/dev-chains.sh</code>.
    </Notice>
  )
}
