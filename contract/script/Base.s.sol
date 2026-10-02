// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";

/// @dev Shared helpers: who is broadcasting, and where deployment addresses are recorded.
///      Addresses land in `deployments/<chainId>.json`, which the frontend reads.
///      Set DEPLOYMENTS_DIR=deployments/local for local runs so they never overwrite the real ones.
abstract contract MandateScript is Script {
    // Sepolia ENS (https://docs.ens.domains/learn/deployments)
    address internal constant SEPOLIA_ENS_REGISTRY = 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e;
    address internal constant SEPOLIA_PUBLIC_RESOLVER = 0xE99638b40E4Fff0129D56f03b55b6bbC4BBE49b5;
    /// namehash("borrowerlist.n4vnt.eth")
    bytes32 internal constant BORROWER_ROOT = 0x8f7d6f386b899e662d8ffffe5abf1a017bb202edf791763fa27a41cc06e21521;
    /// namehash("lenderlist.n4vnt.eth")
    bytes32 internal constant LENDER_ROOT = 0xa7af8f7962f3c01f31d162b75a49751bb0889c560e8c384b10cf121be57b15b8;
    /// The first prototype's subname controller. It accepts any parent node, so its operator approval
    /// lets anyone take over names owned by whoever approved it. HandOverRoots revokes it.
    address internal constant LEGACY_CONTROLLER = 0xEc42444a4B113E0ee11cb919239b0Cc1f2f8ACCF;

    // Arc testnet USDC (ERC-20 interface, 6 decimals) — https://docs.arc.network
    address internal constant ARC_USDC = 0x3600000000000000000000000000000000000000;

    function _broadcaster() internal returns (address sender) {
        (, sender,) = vm.readCallers();
    }

    function _deploymentsFile() internal view returns (string memory) {
        string memory dir = vm.envOr("DEPLOYMENTS_DIR", string("deployments"));
        return string.concat(vm.projectRoot(), "/", dir, "/", vm.toString(block.chainid), ".json");
    }

    /// Writes `key: value` into this chain's deployments file, keeping the other keys.
    function _record(string memory key, address value) internal {
        string memory file = _deploymentsFile();
        if (!vm.isFile(file)) {
            vm.writeJson("{}", file);
        }
        vm.writeJson(vm.toString(value), file, string.concat(".", key));
        console.log("  %s: %s", key, value);
    }

    function _recordUint(string memory key, uint256 value) internal {
        string memory file = _deploymentsFile();
        if (!vm.isFile(file)) {
            vm.writeJson("{}", file);
        }
        vm.writeJson(vm.toString(value), file, string.concat(".", key));
    }
}
