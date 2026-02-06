// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ENSRegistry {
    function setSubnodeRecord(
        bytes32 node,
        bytes32 label,
        address owner,
        address resolver,
        uint64 ttl
    ) external;
}

contract ENSController {
    bytes32 public constant BORROW_ROOT_NODE =
        0x8f7d6f386b899e662d8ffffe5abf1a017bb202edf791763fa27a41cc06e21521; //namehash(borrowerlist.n4vnt.eth)
    ENSRegistry public ens;
    constructor(address _ens) {
        ens = ENSRegistry(_ens);
    }

    function createSubdomain(bytes32 label) external {
        ens.setSubnodeRecord(
            BORROW_ROOT_NODE,
            label,
            msg.sender,
            address(0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5),
            0
        );
    }
}
