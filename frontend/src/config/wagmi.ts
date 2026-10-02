import { createConfig, createConnector, http, injected, mock, type CreateConnectorFn } from 'wagmi'
import type { Address } from 'viem'
import { arc, isLocal, sepolia } from './chains'

/**
 * anvil's well-known unlocked accounts, as wallets for the local chains (scripts/dev-chains.sh).
 * Account 1 starts with no profile; the others are seeded lenders and borrowers.
 */
const DEV_ACCOUNTS: { address: Address; name: string }[] = [
  { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', name: 'Dev wallet · New user' },
  { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', name: 'Dev wallet · Northwind (lender)' },
  { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', name: 'Dev wallet · Monsoon (lender)' },
  { address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', name: 'Dev wallet · Acme (borrower)' },
  { address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9', name: 'Dev wallet · Greenleaf (borrower)' },
]

function devWallet(address: Address, name: string, index: number): CreateConnectorFn {
  const base = mock({ accounts: [address], features: { reconnect: true } })
  return createConnector((config) => ({ ...base(config), id: `dev-wallet-${index}`, name }))
}

const connectors: CreateConnectorFn[] = [
  // Extension wallets announce themselves (EIP-6963) and are added automatically;
  // this catches older ones that only set window.ethereum.
  injected(),
  ...(isLocal ? DEV_ACCOUNTS.map((a, i) => devWallet(a.address, a.name, i)) : []),
]

export const config = createConfig({
  chains: [sepolia, arc],
  connectors,
  transports: {
    [sepolia.id]: http(),
    [arc.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
