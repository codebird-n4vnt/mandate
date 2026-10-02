import { useEffect, useRef, useState } from 'react'
import { useConnect, useConnection, useConnectors, useDisconnect, type Connector } from 'wagmi'
import { Check, ChevronDown, Copy, ExternalLink, LogOut, Wallet } from 'lucide-react'
import { arc, explorerAddress, FAUCETS, sepolia } from '@/config/chains'
import { formatUsdc, shortAddress } from '@/lib/format'
import { describeError } from '@/lib/errors'
import { useGas, useUsdc } from '@/hooks/useUsdc'
import { Modal } from './Modal'
import { Button } from './ui'

/** Extension wallets found via EIP-6963, plus the generic fallback only when nothing announced itself. */
function useWalletList(): Connector[] {
  const connectors = useConnectors()
  const announced = connectors.filter((c) => c.type === 'injected' && c.id !== 'injected')
  const dev = connectors.filter((c) => c.type === 'mock')
  const generic = connectors.filter((c) => c.id === 'injected')
  const hasWindowEthereum = typeof window !== 'undefined' && 'ethereum' in window
  return [...announced, ...(announced.length === 0 && hasWindowEthereum ? generic : []), ...dev]
}

export function ConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const wallets = useWalletList()
  const { connectAsync } = useConnect()
  const [pending, setPending] = useState<string>()
  const [error, setError] = useState<string>()

  const connect = async (connector: Connector) => {
    setError(undefined)
    setPending(connector.uid)
    try {
      await connectAsync({ connector })
      onClose()
    } catch (e) {
      setError(describeError(e))
    } finally {
      setPending(undefined)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Connect a wallet">
      {wallets.length === 0 ? (
        <div className="space-y-4">
          <p className="leading-relaxed">
            No browser wallet found. Install one, then reload this page. Any EVM wallet works; these are common:
          </p>
          <ul className="space-y-2 font-mono text-sm">
            <li>
              <a className="underline" href="https://metamask.io/download" target="_blank" rel="noreferrer">
                MetaMask ↗
              </a>
            </li>
            <li>
              <a className="underline" href="https://rabby.io" target="_blank" rel="noreferrer">
                Rabby ↗
              </a>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">On a phone, open Mandate inside your wallet app’s browser.</p>
        </div>
      ) : (
        <ul className="-mx-5 -mt-5">
          {wallets.map((w) => (
            <li key={w.uid} className="border-b border-foreground/15">
              <button
                onClick={() => connect(w)}
                disabled={Boolean(pending)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {w.icon ? (
                  <img src={w.icon} alt="" className="size-7" />
                ) : (
                  <span className="flex size-7 items-center justify-center border border-current">
                    <Wallet className="size-4" />
                  </span>
                )}
                <span className="flex-1 font-display text-xl">{w.id === 'injected' ? 'Browser wallet' : w.name}</span>
                {pending === w.uid && <span className="font-mono text-xs">Check your wallet…</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-4 font-mono text-xs text-alert">{error}</p>}
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Mandate uses two test networks: profiles live on Ethereum Sepolia (ENS) and loans settle in USDC on Arc. Your
        wallet will be asked to switch when needed.
      </p>
    </Modal>
  )
}

function AccountMenu({ onClose }: { onClose: () => void }) {
  const { address, connector } = useConnection()
  const { disconnect } = useDisconnect()
  const { balance } = useUsdc()
  const gas = useGas()
  const [copied, setCopied] = useState(false)
  if (!address) return null

  const copy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const explorer = explorerAddress(arc.id, address)
  return (
    <div className="absolute right-0 top-full z-40 mt-2 w-72 animate-rise border-2 border-foreground bg-background shadow-[6px_6px_0_0_#0a0a0a]">
      <div className="border-b border-foreground/15 px-4 py-3">
        <p className="eyebrow">{connector?.name ?? 'Wallet'}</p>
        <p className="mt-1 break-all font-mono text-xs">{address}</p>
      </div>
      <dl className="space-y-2 border-b border-foreground/15 px-4 py-3 font-mono text-xs">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">USDC on Arc</dt>
          <dd>{balance === undefined ? '—' : formatUsdc(balance)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Sepolia ETH (gas)</dt>
          <dd>{gas[sepolia.id] === undefined ? '—' : (Number(gas[sepolia.id]) / 1e18).toFixed(4)}</dd>
        </div>
        {(gas[sepolia.id] === 0n || balance === 0n) && (
          <div className="flex flex-wrap gap-x-3 pt-1">
            {gas[sepolia.id] === 0n && (
              <a className="underline" href={FAUCETS[sepolia.id].url} target="_blank" rel="noreferrer">
                {FAUCETS[sepolia.id].label} ↗
              </a>
            )}
            {balance === 0n && (
              <a className="underline" href={FAUCETS[arc.id].url} target="_blank" rel="noreferrer">
                {FAUCETS[arc.id].label} ↗
              </a>
            )}
          </div>
        )}
      </dl>
      <div className="flex flex-col py-1 font-mono text-xs uppercase tracking-widest">
        <button onClick={copy} className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Copied' : 'Copy address'}
        </button>
        {explorer && (
          <a href={explorer} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted">
            <ExternalLink className="size-4" /> View on ArcScan
          </a>
        )}
        <button
          onClick={() => {
            disconnect()
            onClose()
          }}
          className="flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted"
        >
          <LogOut className="size-4" /> Disconnect
        </button>
      </div>
    </div>
  )
}

export function WalletButton() {
  const { address, status } = useConnection()
  const [modal, setModal] = useState(false)
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  if (!address) {
    return (
      <>
        <Button onClick={() => setModal(true)} loading={status === 'connecting' || status === 'reconnecting'}>
          Connect wallet
        </Button>
        <ConnectModal open={modal} onClose={() => setModal(false)} />
      </>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setMenu((m) => !m)}
        aria-expanded={menu}
        className="flex h-12 items-center gap-2 border-2 border-foreground px-4 font-mono text-xs font-bold tracking-wider hover:bg-foreground hover:text-background"
      >
        <span className="size-2 bg-ok" aria-hidden />
        {shortAddress(address)}
        <ChevronDown className="size-4" />
      </button>
      {menu && <AccountMenu onClose={() => setMenu(false)} />}
    </div>
  )
}
