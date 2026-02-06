// https://github.com/ensdomains/ensjs/blob/main/docs/wallet/function.setRecords.md

import { WagmiProvider } from 'wagmi'
import { config } from './config/WagmiConfig'
import Home from './pages/BorrowerProfile';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';



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



