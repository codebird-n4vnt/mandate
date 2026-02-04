import { normalize } from 'viem/ens'
import { useEnsResolver } from 'wagmi'
 
export const MyResolver = () => {
  const { data: myResolver } = useEnsResolver({
    name: normalize('n4vnt.eth'), // The name to lookup
    chainId: 11155111,
  })
 
  return <div>{myResolver}</div>
}