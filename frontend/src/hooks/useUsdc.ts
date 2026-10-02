import { erc20Abi, type Address } from 'viem'
import { useBalance, useConnection, useReadContracts } from 'wagmi'
import { arc, sepolia } from '@/config/chains'
import { LOANS_ADDRESS, USDC_ADDRESS } from '@/config/contracts'

/** The connected wallet's USDC balance on Arc and its allowance to MandateLoans. */
export function useUsdc() {
  const { address } = useConnection()
  const query = useReadContracts({
    allowFailure: false,
    contracts: [
      { address: USDC_ADDRESS, abi: erc20Abi, functionName: 'balanceOf', args: [address!], chainId: arc.id },
      {
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address!, LOANS_ADDRESS as Address],
        chainId: arc.id,
      },
    ],
    query: { enabled: Boolean(address && LOANS_ADDRESS), refetchInterval: 15_000 },
  })
  return { ...query, balance: query.data?.[0], allowance: query.data?.[1] }
}

/** Gas money on each chain: ETH on Sepolia, native USDC on Arc. */
export function useGas() {
  const { address } = useConnection()
  const sepoliaGas = useBalance({ address, chainId: sepolia.id, query: { enabled: Boolean(address) } })
  const arcGas = useBalance({ address, chainId: arc.id, query: { enabled: Boolean(address) } })
  return { [sepolia.id]: sepoliaGas.data?.value, [arc.id]: arcGas.data?.value } as Record<number, bigint | undefined>
}
