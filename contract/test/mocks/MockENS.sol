// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev The authorisation rules of the real ENSRegistry: only a node's owner, or an operator the owner
///      approved, can change it or create subnodes under it.
contract MockENSRegistry {
    struct Record {
        address owner;
        address resolver;
        uint64 ttl;
    }

    mapping(bytes32 => Record) internal records;
    mapping(address => mapping(address => bool)) internal operators;

    modifier authorised(bytes32 node) {
        address owner_ = records[node].owner;
        require(owner_ == msg.sender || operators[owner_][msg.sender], "ENS: unauthorised");
        _;
    }

    constructor() {
        records[0x0].owner = msg.sender;
    }

    function owner(bytes32 node) external view returns (address) {
        return records[node].owner;
    }

    function resolver(bytes32 node) external view returns (address) {
        return records[node].resolver;
    }

    function setOwner(bytes32 node, address owner_) external authorised(node) {
        records[node].owner = owner_;
    }

    function setSubnodeOwner(bytes32 node, bytes32 label, address owner_) public authorised(node) returns (bytes32) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        records[subnode].owner = owner_;
        return subnode;
    }

    function setSubnodeRecord(bytes32 node, bytes32 label, address owner_, address resolver_, uint64 ttl) external {
        bytes32 subnode = setSubnodeOwner(node, label, owner_);
        records[subnode].resolver = resolver_;
        records[subnode].ttl = ttl;
    }

    function setApprovalForAll(address operator, bool approved) external {
        operators[msg.sender][operator] = approved;
    }

    function isApprovedForAll(address owner_, address operator) external view returns (bool) {
        return operators[owner_][operator];
    }
}

/// @dev The authorisation rules of the real PublicResolver: the node's registry owner, or an operator
///      approved on the resolver itself.
contract MockPublicResolver {
    MockENSRegistry public immutable ens;
    mapping(bytes32 => mapping(string => string)) internal texts;
    mapping(bytes32 => address) internal addrs;
    mapping(address => mapping(address => bool)) internal approvals;

    constructor(MockENSRegistry ens_) {
        ens = ens_;
    }

    modifier authorised(bytes32 node) {
        address owner_ = ens.owner(node);
        require(owner_ == msg.sender || approvals[owner_][msg.sender], "Resolver: unauthorised");
        _;
    }

    function setApprovalForAll(address operator, bool approved) external {
        approvals[msg.sender][operator] = approved;
    }

    function setText(bytes32 node, string calldata key, string calldata value) external authorised(node) {
        texts[node][key] = value;
    }

    function setAddr(bytes32 node, address a) external authorised(node) {
        addrs[node] = a;
    }

    function text(bytes32 node, string calldata key) external view returns (string memory) {
        return texts[node][key];
    }

    function addr(bytes32 node) external view returns (address payable) {
        return payable(addrs[node]);
    }
}
