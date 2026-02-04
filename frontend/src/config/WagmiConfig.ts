import { mainnet, sepolia } from "viem/chains";
import { createConfig, http, injected } from "wagmi";

export const config = createConfig(
    {
        chains:[sepolia, mainnet],
        connectors:[injected()],
        transports:{
            [sepolia.id]: http(),
            [mainnet.id]: http(),
        }
    }
)