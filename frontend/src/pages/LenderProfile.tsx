import { useConnection, useWriteContractSync } from "wagmi";

import { labelhash } from "viem/ens";
import { ResolverABI, SubDomainABI } from "../ens/ABI";
import Wallet from "../components/Wallet";

import { useState } from "react";
import { encodeFunctionData, namehash } from "viem";


const LenderProfile = () => {
  const connection = useConnection();
  const subnameOwner = connection?.address;
  const newhash = labelhash(subnameOwner?.toString() as string).slice(2,6); //deterministically deriving label for subname
  const hashedlabel = labelhash(newhash);
  const writeContractSync = useWriteContractSync();
  

  console.log(hashedlabel);

  const nodeString = `${newhash}.lenderslist.n4vnt.eth`;
  const node = namehash(nodeString);
  console.log(node)

  //states
  const [fullName, setFullName] = useState("");
  const [value, setValue] = useState("");
  const [assets, setAssets] = useState("");
  const [currency, setCurrency] = useState("");
  const [company, setCompany] = useState("");

  const createSubname = async () => {
    await writeContractSync.mutateAsync({
      abi: SubDomainABI,
      address: "0x0f00f7F0e77982AEf050D921002376B264db6f11",
      functionName: "createSubdomain",
      args: [hashedlabel],
    });
  };

  const setRecord = async () => {
  const texts = [  
  { key: "fullName", value: fullName },  
  { key: "value", value: value },  
  { key: "assets", value: assets },  
  { key: "currency", value: currency },  
  { key: "company", value: company },  
]  
  
// Encode each setText call  
const calls = texts.map(({ key, value }) =>  
  encodeFunctionData({  
    abi: ResolverABI,  
    functionName: 'setText',  
    args: [node, key, value]  
  })  
)  
  
// Execute all in one transaction  
await writeContractSync.mutateAsync({  
  abi: ResolverABI,  
  address: '0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5',  
  functionName: 'multicall',  
  args: [calls]  
})
  };

  return (
    <>
      <Wallet />
      <div>
        <button onClick={createSubname}>Create subname</button>
        {/* {hash} */}
      </div>

      <div>
        <h5>Your full name</h5>
        <label htmlFor="key">Key</label>
        <input type="text" disabled={true} placeholder="fullName" />

        <label htmlFor="key">Value</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <h5>Value of your assets</h5>
        <label htmlFor="key">Key</label>
        <input type="text" disabled={true} placeholder="valueOfAssets" />

        <label htmlFor="key">Value</label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>

      <div>
        <h5>Assets</h5>
        <label htmlFor="key">Key</label>
        <input type="text" disabled={true} placeholder="Assets" />

        <label htmlFor="key">Value</label>
        <input
          type="text"
          value={assets}
          onChange={(e) => setAssets(e.target.value)}
        />
      </div>
      <div>
        <h5>Currency</h5>
        <label htmlFor="key">Key</label>
        <input type="text" disabled placeholder="Currency" />

        <label htmlFor="key">Value</label>
        <input
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        />
      </div>
      <div>
        <h5>Your Company name</h5>
        <label htmlFor="key">Key</label>
        <input type="text" disabled placeholder="Company" />

        <label htmlFor="key">Value</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <button onClick={setRecord}>Set Records</button>
    </>
  );
};

export default LenderProfile;
