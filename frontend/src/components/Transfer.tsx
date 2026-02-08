// import { useState } from "react";
// import { erc20Abi } from "viem";
// import { useWriteContractSync } from "wagmi";

// const TOKEN_ADDRESS = "0x3600000000000000000000000000000000000000";
// // const SPENDER_ADDRESS = '0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25';

// const myContractAbi = [
//   {
//     type: "function",
//     name: "deposit",
//     inputs: [
//       { name: "_amount", type: "uint256", internalType: "uint256" },
//       { name: "_to", type: "address", internalType: "address" },
//     ],
//     outputs: [],
//     stateMutability: "nonpayable",
//   },
//   {
//     type: "function",
//     name: "admin",
//     inputs: [],
//     outputs: [{ name: "", type: "address", internalType: "address" }],
//     stateMutability: "view",
//   },
// ];

// export function ArcDepositFunction() {
//   const writeContractSync = useWriteContractSync();
//   const [amount, setAmount] = useState("");
//   const [to, setTo] = useState("");

//   const handleAction = async () => {
//     await writeContractSync.mutateAsync({
//       address: TOKEN_ADDRESS,
//       abi: erc20Abi,
//       functionName: "approve",
//       args: ["0xd9fFE35Af94D24a630D7262275CB119636F5A865", BigInt(amount)], // Or use max uint256 for infinite approval
//     });

//     await writeContractSync.mutateAsync({
//       address: "0xd9fFE35Af94D24a630D7262275CB119636F5A865",
//       abi: myContractAbi,
//       functionName: "deposit",
//       args: [amount, to],
//     });
//   };

//   return (
//     <>
//       <label htmlFor="">Input the amount</label>
//       <input
//         type="text"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />

//       <label htmlFor="">To</label>
//       <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
//       <button onClick={handleAction}>Approve and deposit</button>

//       {writeContractSync.status}

//       <button
//         onClick={async () => {
//           await writeContractSync.mutateAsync({
//             address: "0xd9fFE35Af94D24a630D7262275CB119636F5A865",
//             abi: myContractAbi,
//             functionName: "deposit",
//             args: [amount, to],
//           });
//         }}
//       >
//         Check Admin
//       </button>
//       {writeContractSync.data?.transactionHash}
//     </>
//   );
// }


import { useState } from "react";
import { erc20Abi } from "viem";
import { useWriteContractSync } from "wagmi";
import { ArrowRight, ShieldCheck, Activity } from "lucide-react";
import FLoader from "./FLoader";

const TOKEN_ADDRESS = "0x3600000000000000000000000000000000000000";
const SPENDER_ADDRESS = "0xd9fFE35Af94D24a630D7262275CB119636F5A865";

const myContractAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "_amount", type: "uint256", internalType: "uint256" },
      { name: "_to", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

export function Transfer() {
  const writeContractSync = useWriteContractSync();
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");

  const handleAction = async () => {
    if (!amount || !to) return;
    
    // Approval Step
    await writeContractSync.mutateAsync({
      address: TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [SPENDER_ADDRESS, BigInt(amount)],
    });

    // Deposit Step
    await writeContractSync.mutateAsync({
      address: SPENDER_ADDRESS,
      abi: myContractAbi,
      functionName: "deposit",
      args: [BigInt(amount), to as `0x${string}`],
    });
  };

  return (
    <section className="relative w-full max-w-4xl mx-auto py-24 px-6 md:px-12 border-x border-black/10">
      {writeContractSync.isPending&&<FLoader/>}
      {/* Decorative Noise & Line Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml,...')] z-0" />
      
      {/* Header Section */}
      <div className="mb-20 border-b-4 border-black pb-8">
        <h2 className="font-display text-6xl md:text-7xl lg:text-8xl tracking-tighter uppercase leading-none">
          Asset <br /> Deposit
        </h2>
        <div className="mt-6 flex items-center gap-4 font-mono text-xs tracking-widest uppercase text-muted-foreground">
          <Activity size={14} strokeWidth={1.5} />
          <span>Status: {writeContractSync.status || "Idle"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
        {/* Input Controls */}
        <div className="space-y-12">
          <div className="group">
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] mb-4 text-muted-foreground">
              Principal Amount
            </label>
            <input
              type="text"
              placeholder="0.00"
              className="w-full bg-transparent border-b-2 border-black py-4 font-display text-4xl italic placeholder:opacity-20 focus:outline-none focus:border-b-4 transition-all duration-100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="group">
            <label className="block font-mono text-[10px] uppercase tracking-[0.2em] mb-4 text-muted-foreground">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full bg-transparent border-b-2 border-black py-4 font-mono text-sm placeholder:italic focus:outline-none focus:border-b-4 transition-all duration-100"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        {/* Action Column */}
        <div className="flex flex-col justify-end space-y-6">
          <button
            onClick={handleAction}
            className="w-full bg-black text-white p-8 flex items-center justify-between group hover:bg-white hover:text-black border-2 border-black transition-colors duration-100 focus-visible:outline-3 focus-visible:outline-black focus-visible:outline-offset-4"
          >
            <span className="font-mono text-sm tracking-widest uppercase">Execute Transaction</span>
            <ArrowRight className="transition-transform group-hover:translate-x-2" />
          </button>

          <button
            onClick={async () => {
                await writeContractSync.mutateAsync({
                  address: SPENDER_ADDRESS,
                  abi: myContractAbi,
                  functionName: "deposit",
                  args: [BigInt(amount), to as `0x${string}`],
                });
              }}
            className="w-full border-2 border-black p-4 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-colors duration-100"
          >
            <ShieldCheck size={16} strokeWidth={1.5} />
            Check Administrative Rights
          </button>
        </div>
      </div>

      {/* Footer Metadata */}
      {writeContractSync.data?.transactionHash && (
        <div className="mt-20 pt-8 border-t border-black/10">
          <p className="font-mono text-[10px] uppercase text-muted-foreground mb-2 tracking-widest">Receipt Hash</p>
          <p className="font-mono text-xs break-all border border-black/5 p-4 bg-muted/30">
            {writeContractSync.data.transactionHash}
          </p>
        </div>
      )}
    </section>
  );
}