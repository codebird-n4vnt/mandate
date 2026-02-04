// https://github.com/ensdomains/ensjs/blob/main/docs/wallet/function.setRecords.md
import { addEnsContracts } from '@ensdomains/ensjs'
import { normalise } from '@ensdomains/ensjs/utils'
import { setRecords } from '@ensdomains/ensjs/wallet'
import { createWalletClient, custom } from 'viem'
import { sepolia } from 'viem/chains'
import { namehash } from 'viem/ens'

// import namehash from 'eth-ens-namehash';
// import { keccak256, toUtf8Bytes } from 'viem'
 
const wallet = createWalletClient({
  chain: addEnsContracts(sepolia),
  transport: custom(window.ethereum!),
})


const [account] = await wallet.getAddresses()
// const borrower1 = account[0];
export const hash = await setRecords(wallet, {
  account,
  name: `borrower1.borrowerlist.n4vnt.eth`,
  resolverAddress: `0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5`,
  texts:[
    {key:'valueOfAssets',value:'10'}]
  , 
})

// 0x...





const normalizedHash = normalise('borrowerlist.n4vnt.eth')
export const ROOT_NODE = namehash(normalizedHash)
// const LABEL_HASH = keccak256(toUtf8Bytes('borrower1'))

