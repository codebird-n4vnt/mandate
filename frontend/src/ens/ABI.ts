export const SubDomainABI = [
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "label",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "ROOT_NODE",
				"type": "bytes32"
			}
		],
		"name": "createSubdomain",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	
]


export const ResolverABI = [
  {
    inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
    name: "multicall",
    outputs: [{ internalType: "bytes[]", name: "results", type: "bytes[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "node", type: "bytes32" },
      { internalType: "string", name: "key", type: "string" },
      { internalType: "string", name: "value", type: "string" },
    ],
    name: "setText",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]
