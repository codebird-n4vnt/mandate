/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** RPC for Ethereum Sepolia, where profiles live in ENS. */
  readonly VITE_SEPOLIA_RPC_URL?: string
  /** RPC for Arc testnet, where loans settle in USDC. */
  readonly VITE_ARC_RPC_URL?: string
  /** Overrides for contract/deployments/<chainId>.json. */
  readonly VITE_REGISTRY_ADDRESS?: `0x${string}`
  readonly VITE_LOANS_ADDRESS?: `0x${string}`
  readonly VITE_USDC_ADDRESS?: `0x${string}`
  /** "true" adds anvil's unlocked test accounts as wallets. Local chains only. */
  readonly VITE_DEV_WALLET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
