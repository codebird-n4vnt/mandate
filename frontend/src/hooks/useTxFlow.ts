import { useCallback, useState } from 'react'
import { useConfig } from 'wagmi'
import { getConnection, switchChain, waitForTransactionReceipt } from 'wagmi/actions'
import { useQueryClient } from '@tanstack/react-query'
import type { Hex, TransactionReceipt } from 'viem'
import { chainName, explorerTx, type AppChainId } from '@/config/chains'
import { describeError } from '@/lib/errors'
import { useToast } from '@/components/Toaster'

export interface TxStep {
  label: string
  chainId: AppChainId
  /** Sends the transaction and returns its hash. */
  send: () => Promise<Hex>
  /** Return true to skip this step (e.g. an approval that already exists). */
  skip?: () => Promise<boolean>
}

export type StepStatus = 'waiting' | 'switching' | 'signing' | 'confirming' | 'done' | 'skipped' | 'failed'

export interface StepState {
  label: string
  chainId: AppChainId
  status: StepStatus
  hash?: Hex
}

/**
 * Runs a sequence of transactions (e.g. approve, then offer): switches the wallet to the right network
 * for each, waits for every receipt, and reports progress, errors and explorer links.
 */
export function useTxFlow() {
  const config = useConfig()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [steps, setSteps] = useState<StepState[]>([])
  const [error, setError] = useState<string>()
  const [running, setRunning] = useState(false)

  const update = (i: number, patch: Partial<StepState>) =>
    setSteps((s) => s.map((step, j) => (j === i ? { ...step, ...patch } : step)))

  const run = useCallback(
    async (plan: TxStep[], success?: { title: string; body?: string }): Promise<TransactionReceipt[] | undefined> => {
      setError(undefined)
      setRunning(true)
      setSteps(plan.map((p) => ({ label: p.label, chainId: p.chainId, status: 'waiting' })))
      const receipts: TransactionReceipt[] = []
      let current = 0
      try {
        for (; current < plan.length; current++) {
          const step = plan[current]
          if (step.skip && (await step.skip())) {
            update(current, { status: 'skipped' })
            continue
          }
          if (getConnection(config).chainId !== step.chainId) {
            update(current, { status: 'switching' })
            await switchChain(config, { chainId: step.chainId })
          }
          update(current, { status: 'signing' })
          const hash = await step.send()
          update(current, { status: 'confirming', hash })
          const receipt = await waitForTransactionReceipt(config, { chainId: step.chainId, hash })
          if (receipt.status !== 'success') throw new Error(`${step.label} failed on ${chainName(step.chainId)}.`)
          receipts.push(receipt)
          update(current, { status: 'done' })
        }
        if (success) {
          const last = receipts.at(-1)
          toast({
            tone: 'ok',
            ...success,
            href: last ? explorerTx(plan[plan.length - 1].chainId, last.transactionHash) : undefined,
          })
        }
        return receipts
      } catch (e) {
        const message = describeError(e)
        update(current, { status: 'failed' })
        setError(message)
        toast({ tone: 'alert', title: 'That didn’t go through', body: message })
        return undefined
      } finally {
        setRunning(false)
        await queryClient.invalidateQueries()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, queryClient, toast],
  )

  const reset = useCallback(() => {
    setSteps([])
    setError(undefined)
  }, [])

  return { run, steps, error, running, reset }
}
