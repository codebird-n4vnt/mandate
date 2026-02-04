// https://github.com/ensdomains/ensjs/blob/main/docs/wallet/function.setRecords.md

import { WagmiProvider } from 'wagmi'
import { config } from './config/WagmiConfig'
import Home from './pages/Home';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



// 0x...

// const wallet = createWalletClient({
//   chain: addEnsContracts(mainnet),
//   transport: custom(window.ethereum),
// })
// const hash = await setRecords(wallet, {
//   name: 'ens.eth',
//   coins: [
//     {
//       coin: 'ETH',
//       value: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
//     },
//   ],
//   texts: [{ key: 'foo', value: 'bar' }],
//   resolverAddress: My,
// })

const queryClient = new QueryClient();
function App(){
  return(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Home/>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App;



