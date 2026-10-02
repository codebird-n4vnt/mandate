import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { arc, explorerAddress, sepolia } from '@/config/chains'
import { LOANS_ADDRESS, REGISTRY_ADDRESS } from '@/config/contracts'
import { Navbar } from './Navbar'

function Footer() {
  const registry = REGISTRY_ADDRESS && explorerAddress(sepolia.id, REGISTRY_ADDRESS)
  const loans = LOANS_ADDRESS && explorerAddress(arc.id, LOANS_ADDRESS)
  return (
    <footer className="mt-24 border-t-8 border-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-10">
        <div>
          <p className="font-display text-3xl font-bold italic tracking-tighter">Mandate</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Credit intents on ENS, loans settled in USDC on Arc. Testnet software: no real money, no audit yet.
          </p>
        </div>
        <div className="font-mono text-xs leading-6">
          <p className="eyebrow mb-2">Contracts</p>
          {registry ? (
            <a className="block underline" href={registry} target="_blank" rel="noreferrer">
              MandateRegistry · Sepolia ↗
            </a>
          ) : (
            <p>MandateRegistry · {REGISTRY_ADDRESS ? 'local' : 'not deployed'}</p>
          )}
          {loans ? (
            <a className="block underline" href={loans} target="_blank" rel="noreferrer">
              MandateLoans · Arc testnet ↗
            </a>
          ) : (
            <p>MandateLoans · {LOANS_ADDRESS ? 'local' : 'not deployed'}</p>
          )}
        </div>
        <div className="font-mono text-xs leading-6">
          <p className="eyebrow mb-2">Built on</p>
          <a className="block underline" href="https://docs.ens.domains" target="_blank" rel="noreferrer">
            ENS ↗
          </a>
          <a className="block underline" href="https://www.arc.network" target="_blank" rel="noreferrer">
            Arc by Circle ↗
          </a>
          <a className="block underline" href="https://github.com/codebird-n4vnt/mandate" target="_blank" rel="noreferrer">
            Source on GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-10">{children}</div>
}
