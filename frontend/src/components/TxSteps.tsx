import { Check, Circle, Loader2, Minus, X } from 'lucide-react'
import type { StepState } from '@/hooks/useTxFlow'
import { chainName, explorerTx } from '@/config/chains'
import { cn } from '@/lib/utils'

const STATUS_TEXT: Record<StepState['status'], string> = {
  waiting: 'Waiting',
  switching: 'Switch network in your wallet',
  signing: 'Confirm in your wallet',
  confirming: 'Confirming on-chain',
  done: 'Done',
  skipped: 'Not needed',
  failed: 'Failed',
}

/** Progress for a multi-transaction action. Renders nothing until a flow starts. */
export function TxSteps({ steps, error }: { steps: StepState[]; error?: string }) {
  if (steps.length === 0 && !error) return null
  return (
    <div className="mt-6 border-2 border-foreground" aria-live="polite">
      <ol>
        {steps.map((step, i) => {
          const active = ['switching', 'signing', 'confirming'].includes(step.status)
          const href = step.hash ? explorerTx(step.chainId, step.hash) : undefined
          return (
            <li
              key={i}
              className={cn(
                'flex items-center gap-4 border-b border-foreground/15 px-4 py-3 last:border-b-0',
                active && 'bg-muted',
              )}
            >
              <span className="flex size-6 shrink-0 items-center justify-center border border-foreground">
                {step.status === 'done' && <Check className="size-4" />}
                {step.status === 'skipped' && <Minus className="size-4" />}
                {step.status === 'failed' && <X className="size-4 text-alert" />}
                {active && <Loader2 className="size-4 animate-spin" />}
                {step.status === 'waiting' && <Circle className="size-2 fill-current opacity-30" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg leading-tight">{step.label}</p>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  {chainName(step.chainId)} · {STATUS_TEXT[step.status]}
                </p>
              </div>
              {href && (
                <a href={href} target="_blank" rel="noreferrer" className="font-mono text-xs underline">
                  tx ↗
                </a>
              )}
            </li>
          )
        })}
      </ol>
      {error && (
        <p className="border-t-2 border-alert bg-alert/5 px-4 py-3 font-mono text-xs text-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
