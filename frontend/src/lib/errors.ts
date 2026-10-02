import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem'

const REVERTS: Record<string, string> = {
  // MandateRegistry
  AlreadyRegistered: 'This wallet already has a profile for this role.',
  InvalidLabel: 'That name isn’t allowed. Use 3–32 lowercase letters, numbers and hyphens.',
  LabelTaken: 'That name was just taken. Pick another.',
  TooManyRecords: 'Too many profile fields.',
  // MandateLoans
  InvalidBorrower: 'You can’t lend to yourself.',
  InvalidPrincipal: 'Enter an amount above zero.',
  InvalidApr: 'APR must be between 0% and 100%.',
  InvalidTerm: 'The term must be between 1 day and 10 years.',
  NotLender: 'Only the lender can do that.',
  NotBorrower: 'Only the borrower can do that.',
  WrongStatus: 'This loan has changed since you loaded it. Refresh and try again.',
  NothingToRepay: 'Nothing is left to repay.',
  // ERC-20
  ERC20InsufficientBalance: 'Not enough USDC in this wallet.',
  ERC20InsufficientAllowance: 'USDC spending wasn’t approved for enough.',
}

/** A sentence a person can act on, from whatever a wallet, RPC or contract threw. */
export function describeError(error: unknown): string {
  if (!error) return ''
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) return 'You declined the request in your wallet.'

    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError)
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName
      if (name && REVERTS[name]) return REVERTS[name]
      if (revert.reason) return revert.reason
    }

    const text = `${error.shortMessage} ${error.details ?? ''}`.toLowerCase()
    if (text.includes('insufficient funds')) return 'Not enough gas money in this wallet for this network.'
    if (text.includes('user rejected') || text.includes('user denied')) return 'You declined the request in your wallet.'
    if (text.includes('chain') && text.includes('not configured')) return 'Your wallet is on a network Mandate doesn’t use.'
    return error.shortMessage
  }
  if (error instanceof Error) return error.message
  return String(error)
}
