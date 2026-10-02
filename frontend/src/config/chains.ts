import { defineChain } from 'viem'
import { arcTestnet, sepolia as sepoliaBase } from 'viem/chains'

/** Ethereum Sepolia: Mandate profiles are ENS subnames here. */
export const sepolia = defineChain({
  ...sepoliaBase,
  rpcUrls: {
    default: { http: [import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'] },
  },
})

/** Arc testnet, Circle's stablecoin-native chain: loans settle here in USDC, and gas is paid in USDC too. */
export const arc = defineChain({
  ...arcTestnet,
  rpcUrls: {
    default: { http: [import.meta.env.VITE_ARC_RPC_URL || arcTestnet.rpcUrls.default.http[0]] },
  },
})

export type AppChainId = typeof sepolia.id | typeof arc.id

/** True when running against the local chains from scripts/dev-chains.sh. */
export const isLocal = import.meta.env.VITE_DEV_WALLET === 'true'

export function chainName(chainId: number) {
  return chainId === arc.id ? 'Arc testnet' : 'Sepolia'
}

export function explorerTx(chainId: number, hash: string) {
  if (isLocal) return undefined
  const chain = chainId === arc.id ? arc : sepolia
  return `${chain.blockExplorers.default.url}/tx/${hash}`
}

export function explorerAddress(chainId: number, address: string) {
  if (isLocal) return undefined
  const chain = chainId === arc.id ? arc : sepolia
  return `${chain.blockExplorers.default.url}/address/${address}`
}

export const FAUCETS: Record<AppChainId, { label: string; url: string }> = {
  [sepolia.id]: { label: 'Get Sepolia ETH', url: 'https://cloud.google.com/application/web3/faucet/ethereum/sepolia' },
  [arc.id]: { label: 'Get testnet USDC', url: 'https://faucet.circle.com' },
}
