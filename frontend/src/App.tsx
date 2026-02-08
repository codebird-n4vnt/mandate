import { WagmiProvider } from "wagmi";
import { config } from "./config/WagmiConfig";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import FinalTermSheet from "./pages/FinalTerms";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';
// import BorrowerProfile from "./pages/BorrowerProfile";
// import FinalQuote from "./pages/FinalQuote";
import Match from "./pages/Match";

const queryClient = new QueryClient();
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Match />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
