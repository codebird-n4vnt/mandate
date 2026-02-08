
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { defineChain, http } from "viem";
// import { defineChain, http } from "viem";
import {sepolia } from "viem/chains";
import {
    braveWallet,
    injectedWallet,
    metaMaskWallet,
    phantomWallet,
    rainbowWallet,
  } from '@rainbow-me/rainbowkit/wallets';
import { createConfig } from "wagmi";


const arcTestnet = defineChain({
    id:5042002,
    name: 'Arc testnet',
    nativeCurrency:{
        decimals:6,
        name:'USDC',
        symbol:'USDC'
    },
    rpcUrls:{
        default:{http: ['https://rpc.testnet.arc.network', 'https://arc-testnet.drpc.org']},

    },
    blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
    },
    testnet: true,

})

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet,rainbowWallet,braveWallet,phantomWallet,injectedWallet],
    },
  ],
  {
    appName: 'Mandate',
    projectId:'ed68ca05d537578648c2d429a055ebb2',
  }
);

export const config = createConfig({
    connectors,
    chains:[sepolia,arcTestnet],
    transports:{
        [sepolia.id]:http(),
        [arcTestnet.id]:http()
    }
})

