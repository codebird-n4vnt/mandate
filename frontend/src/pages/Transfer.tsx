import { useState } from "react";
import { erc20Abi } from "viem";
import { useWriteContractSync } from "wagmi";

const TOKEN_ADDRESS = "0x3600000000000000000000000000000000000000";
// const SPENDER_ADDRESS = '0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25';

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
];

export function ArcDepositFunction() {
  const writeContractSync = useWriteContractSync();
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");

  const handleAction = async () => {
    await writeContractSync.mutateAsync({
      address: TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: ["0xd9fFE35Af94D24a630D7262275CB119636F5A865", BigInt(amount)], // Or use max uint256 for infinite approval
    });

    await writeContractSync.mutateAsync({
      address: "0xd9fFE35Af94D24a630D7262275CB119636F5A865",
      abi: myContractAbi,
      functionName: "deposit",
      args: [amount, to],
    });
  };

  return (
    <>
      <label htmlFor="">Input the amount</label>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label htmlFor="">To</label>
      <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
      <button onClick={handleAction}>Approve and deposit</button>

      {writeContractSync.status}

      <button
        onClick={async () => {
          await writeContractSync.mutateAsync({
            address: "0xd9fFE35Af94D24a630D7262275CB119636F5A865",
            abi: myContractAbi,
            functionName: "deposit",
            args: [amount, to],
          });
        }}
      >
        Check Admin
      </button>
      {writeContractSync.data?.transactionHash}
    </>
  );
}
