// https://github.com/ensdomains/ensjs/blob/main/docs/wallet/function.setRecords.md

import { WagmiProvider } from 'wagmi'
import { config } from './config/WagmiConfig'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FinalTermSheet from './pages/FinalTerms';





const queryClient = new QueryClient();
function App(){
  return(
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FinalTermSheet/>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App;



