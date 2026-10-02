// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice The subset of the ENS registry that Mandate uses.
interface IENS {
    function owner(bytes32 node) external view returns (address);
    function resolver(bytes32 node) external view returns (address);
    function setOwner(bytes32 node, address owner) external;
    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external;
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @notice The subset of the ENS PublicResolver that Mandate uses.
interface IPublicResolver {
    function setText(bytes32 node, string calldata key, string calldata value) external;
    function setAddr(bytes32 node, address a) external;
    function text(bytes32 node, string calldata key) external view returns (string memory);
    function addr(bytes32 node) external view returns (address payable);
}
