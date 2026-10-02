import { useQuery } from '@tanstack/react-query'
import { useConfig, useConnection } from 'wagmi'
import { getPublicClient } from 'wagmi/actions'
import { isAddressEqual, type Address } from 'viem'
import { sepolia } from '@/config/chains'
import { REGISTRY_ADDRESS } from '@/config/contracts'
import { registryAbi } from '@/abi/registry'
import { resolverAbi } from '@/abi/ens'
import {
  FIELDS,
  ROLE_INDEX,
  emptyRecords,
  profileName,
  profileNode,
  type Profile,
  type Records,
  type Role,
} from '@/lib/profile'

const PAGE = 200n

/** Every profile for a role: the registry's directory, plus each profile's ENS text records. */
export function useDirectory(role: Role) {
  const config = useConfig()
  return useQuery({
    queryKey: ['directory', role, REGISTRY_ADDRESS],
    enabled: Boolean(REGISTRY_ADDRESS),
    staleTime: 30_000,
    queryFn: async (): Promise<Profile[]> => {
      const client = getPublicClient(config, { chainId: sepolia.id })
      const registry = { address: REGISTRY_ADDRESS!, abi: registryAbi } as const

      const entries: { account: Address; label: string }[] = []
      for (let start = 0n; ; start += PAGE) {
        const page = await client.readContract({
          ...registry,
          functionName: 'getProfiles',
          args: [ROLE_INDEX[role], start, PAGE],
        })
        entries.push(...page)
        if (BigInt(page.length) < PAGE) break
      }
      if (entries.length === 0) return []

      const resolver = await client.readContract({ ...registry, functionName: 'resolver' })
      const nodes = entries.map((e) => profileNode(role, e.label))
      const texts = await client.multicall({
        allowFailure: true,
        contracts: nodes.flatMap((node) =>
          FIELDS.map((f) => ({ address: resolver, abi: resolverAbi, functionName: 'text', args: [node, f.record] }) as const),
        ),
      })

      return entries.map((entry, i) => {
        const records = emptyRecords()
        FIELDS.forEach((f, j) => {
          const r = texts[i * FIELDS.length + j]
          if (r.status === 'success') records[f.key] = r.result
        })
        return {
          role,
          label: entry.label,
          name: profileName(role, entry.label),
          node: nodes[i],
          account: entry.account,
          records,
        }
      })
    },
  })
}

/** The connected wallet's profile for a role, if it has one. */
export function useMyProfile(role: Role) {
  const { address } = useConnection()
  const directory = useDirectory(role)
  const profile = address ? directory.data?.find((p) => isAddressEqual(p.account, address)) : undefined
  return { ...directory, profile }
}

/** Look up a profile by the account that registered it. */
export function findByAccount(profiles: Profile[] | undefined, account: Address | undefined) {
  if (!profiles || !account) return undefined
  return profiles.find((p) => isAddressEqual(p.account, account))
}

export type { Records }
