// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface Resolver{
    function setText(
        bytes32 node,
        string calldata key,
        string calldata value
    ) external;
}

interface ENSRegistry {
    function setSubnodeOwner(
        bytes32 node, // here we will put the rootnode and it is basically the namehash of the parent node for our purpose we will use namehash('borrowerlist.n4vnt.eth')
        bytes32 label,
        address owner
    ) external;
}

contract ENSController{
    bytes32 public constant ROOT_NODE = 0x8f7d6f386b899e662d8ffffe5abf1a017bb202edf791763fa27a41cc06e21521; //namehash(borrowerlist.n4vnt.eth)
    ENSRegistry public ens;
    Resolver public resolver;

    constructor(address _ens, address _resolver){
        ens = ENSRegistry(_ens);
        resolver = Resolver(_resolver);
    }

    function createSubdomain(string calldata label, address user) external{
        bytes32 labelHash = keccak256(abi.encode(label));
        ens.setSubnodeOwner(ROOT_NODE, labelHash, user);
    }

    function updateData(string calldata key,string calldata value, string calldata label) external{
        bytes32 labelhash = keccak256(abi.encode(label));
        bytes32 node = keccak256(abi.encodePacked(ROOT_NODE, labelhash));
        resolver.setText(node, key, value);
    }   
}





// pragma solidity ^0.8.20;

// interface ENSRegistry {
//     function setSubnodeOwner(
//         bytes32 node,
//         bytes32 label,
//         address owner
//     ) external;
// }

// interface Resolver {
//     function setText(
//         bytes32 node,
//         string calldata key,
//         string calldata value
//     ) external;
// }

// contract ENSController {
//     bytes32 public constant ROOT_NODE =
//         0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae; 
//         // namehash("example.eth")

//     ENSRegistry public ens;
//     Resolver public resolver;

//     constructor(address _ens, address _resolver) {
//         ens = ENSRegistry(_ens);
//         resolver = Resolver(_resolver);
//     }

//     function createSubdomain(
//         string calldata label,
//         address user
//     ) external payable {
//         bytes32 labelHash = keccak256(bytes(label));

//         ens.setSubnodeOwner(
//             ROOT_NODE,
//             labelHash,
//             address(this)
//         );

//         bytes32 node = keccak256(
//             abi.encodePacked(ROOT_NODE, labelHash)
//         );

//         resolver.setText(node, "owner", "user-controlled");
//     }
// }

