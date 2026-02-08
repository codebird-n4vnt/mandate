
import { defineChain, http } from "viem";
import {sepolia } from "viem/chains";
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

export const config = createConfig(
    {
        // projectId: 'ed68ca05d537578648c2d429a055ebb2',
        chains:[sepolia,arcTestnet],
        transports:{
            [sepolia.id]:http(),
            [arcTestnet.id]:http()
        }
    }
)