import type { Address } from 'viem'
import { arc, sepolia } from './chains'

type Deployment = { registry?: Address; loans?: Address; usdc?: Address; registryBlock?: number; loansBlock?: number }

// Written by the Foundry deploy scripts (contract/script). Missing until the contracts are deployed.
const deployments = import.meta.glob<Deployment>('../../../contract/deployments/*.json', {
  eager: true,
  import: 'default',
})

function deployment(chainId: number): Deployment {
  return deployments[`../../../contract/deployments/${chainId}.json`] ?? {}
}

const env = import.meta.env

/** MandateRegistry on Sepolia: issues profile subnames and lists every profile. */
export const REGISTRY_ADDRESS: Address | undefined = env.VITE_REGISTRY_ADDRESS || deployment(sepolia.id).registry

/** MandateLoans on Arc: offers, escrow, acceptance and repayment. */
export const LOANS_ADDRESS: Address | undefined = env.VITE_LOANS_ADDRESS || deployment(arc.id).loans

/** USDC on Arc (ERC-20 interface, 6 decimals). */
export const USDC_ADDRESS: Address =
  env.VITE_USDC_ADDRESS || deployment(arc.id).usdc || '0x3600000000000000000000000000000000000000'

export const USDC_DECIMALS = 6

export const ROOT_NAMES = {
  borrower: 'borrowerlist.n4vnt.eth',
  lender: 'lenderlist.n4vnt.eth',
} as const

export const ENS_APP_URL = 'https://sepolia.app.ens.domains'
