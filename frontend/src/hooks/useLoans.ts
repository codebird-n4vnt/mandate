import { useQuery } from '@tanstack/react-query'
import { useConfig, useConnection } from 'wagmi'
import { getPublicClient } from 'wagmi/actions'
import { isAddressEqual, type Address } from 'viem'
import { arc } from '@/config/chains'
import { LOANS_ADDRESS } from '@/config/contracts'
import { loansAbi } from '@/abi/loans'
import { toLoan, type Loan } from '@/lib/loans'

const loans = () => ({ address: LOANS_ADDRESS!, abi: loansAbi }) as const

/** Loans where `account` is the lender or the borrower. */
export function useLoansOf(account: Address | undefined) {
  const config = useConfig()
  return useQuery({
    queryKey: ['loans', 'of', account, LOANS_ADDRESS],
    enabled: Boolean(LOANS_ADDRESS && account),
    refetchInterval: 20_000,
    queryFn: async () => {
      const client = getPublicClient(config, { chainId: arc.id })
      const [asLender, asBorrower] = await Promise.all([
        client.readContract({ ...loans(), functionName: 'loansOfLender', args: [account!] }),
        client.readContract({ ...loans(), functionName: 'loansOfBorrower', args: [account!] }),
      ])
      const ids = [...new Set([...asLender, ...asBorrower])].sort((a, b) => (a < b ? 1 : -1))
      if (ids.length === 0) return { lending: [] as Loan[], borrowing: [] as Loan[] }
      const raw = await client.readContract({ ...loans(), functionName: 'getLoans', args: [ids] })
      const all = raw.map((r, i) => toLoan(ids[i], r))
      return {
        lending: all.filter((l) => isAddressEqual(l.lender, account!)),
        borrowing: all.filter((l) => isAddressEqual(l.borrower, account!)),
      }
    },
  })
}

/** The connected wallet's loans. */
export function useMyLoans() {
  const { address } = useConnection()
  return useLoansOf(address)
}

export function useLoan(id: bigint | undefined) {
  const config = useConfig()
  return useQuery({
    queryKey: ['loans', 'one', id?.toString(), LOANS_ADDRESS],
    enabled: Boolean(LOANS_ADDRESS && id !== undefined),
    refetchInterval: 15_000,
    retry: false,
    queryFn: async () => {
      const client = getPublicClient(config, { chainId: arc.id })
      const raw = await client.readContract({ ...loans(), functionName: 'getLoan', args: [id!] })
      return toLoan(id!, raw)
    },
  })
}

/** Protocol-wide numbers for the landing page, and the current fee. */
export function useLoanStats() {
  const config = useConfig()
  return useQuery({
    queryKey: ['loans', 'stats', LOANS_ADDRESS],
    enabled: Boolean(LOANS_ADDRESS),
    staleTime: 30_000,
    queryFn: async () => {
      const client = getPublicClient(config, { chainId: arc.id })
      const [count, originated, repaid, feeBps] = await client.multicall({
        allowFailure: false,
        contracts: [
          { ...loans(), functionName: 'loanCount' },
          { ...loans(), functionName: 'totalOriginated' },
          { ...loans(), functionName: 'totalRepaid' },
          { ...loans(), functionName: 'feeBps' },
        ],
      })
      return { count, originated, repaid, feeBps }
    },
  })
}
