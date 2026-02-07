import { defineChain } from "viem";
import {sepolia } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

const arcTestnet = defineChain({
    id:5042002,
    name: 'Arc testnet',
    nativeCurrency:{
        decimals:6,
        name:'USDC',
        symbol:'USDC'
    },
    rpcUrls:{
        default:{http: ['https://rpc.testnet.arc.network', 'https://arc-testnet.drpc.org', 'https://rpc.testnet.arc.network']},

    },
    blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
    },
    testnet: true,

})

export const config = createConfig(
    {
        chains:[sepolia,arcTestnet],
        connectors:[injected()],
        transports:{
            [sepolia.id]: http(),
            [arcTestnet.id]: http(),
        }
    }
)