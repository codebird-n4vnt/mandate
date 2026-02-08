import { WagmiProvider } from "wagmi";
import { config } from "./config/WagmiConfig";
import {BrowserRouter, Route, Routes} from "react-router-dom"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css';
import LandingPage from "./pages/LandingPage";
import BorrowerProfile from "./pages/BorrowerProfile";
import LenderProfile from "./pages/LenderProfile";
import Match from "./pages/Match";
import FinalQuote from "./pages/FinalQuote";
import FinalTerms from "./pages/FinalTerms";
import Disburse from "./pages/Disburse";

const queryClient = new QueryClient();
function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage/>}/>
              <Route path="/borrower" element={<BorrowerProfile/>}/>
              <Route path="/lender" element={<LenderProfile/>}/>
              <Route path="/match" element={<Match/>}/>
              <Route path="/borrower/finalquote" element={<FinalQuote/>}/>
              <Route path="/borrower/finalterms" element={<FinalTerms/>}/>
              <Route path="/lender/disburse" element={<Disburse/>}/>
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
