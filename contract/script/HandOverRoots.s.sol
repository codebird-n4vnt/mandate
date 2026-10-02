// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {console} from "forge-std/Script.sol";
import {MandateScript} from "./Base.s.sol";
import {IENS} from "../src/interfaces/IENS.sol";

/// @notice Run by the owner of borrowerlist.n4vnt.eth and lenderlist.n4vnt.eth (on Sepolia) after
///         DeployRegistry. It:
///           1. transfers both root names to the registry, so it can issue profile subnames;
///           2. revokes the legacy controller's operator approval, which let anyone take over any name
///              owned by this account (including the two roots).
///
///   REGISTRY=0x... forge script script/HandOverRoots.s.sol --rpc-url sepolia --account <root owner> --broadcast
///
/// REGISTRY defaults to the address in deployments/<chainId>.json.
contract HandOverRoots is MandateScript {
    error NotRootOwner(bytes32 root, address owner);

    function run() external {
        IENS ens = IENS(vm.envOr("ENS_REGISTRY", SEPOLIA_ENS_REGISTRY));
        address registry = vm.envOr("REGISTRY", address(0));
        if (registry == address(0)) {
            registry = vm.parseJsonAddress(vm.readFile(_deploymentsFile()), ".registry");
        }
        bytes32[2] memory roots = [vm.envOr("BORROWER_ROOT", BORROWER_ROOT), vm.envOr("LENDER_ROOT", LENDER_ROOT)];

        vm.startBroadcast();
        address sender = _broadcaster();
        for (uint256 i; i < roots.length; ++i) {
            address current = ens.owner(roots[i]);
            if (current == registry) continue;
            if (current != sender && !ens.isApprovedForAll(current, sender)) revert NotRootOwner(roots[i], current);
            ens.setOwner(roots[i], registry);
        }
        if (ens.isApprovedForAll(sender, LEGACY_CONTROLLER)) {
            ens.setApprovalForAll(LEGACY_CONTROLLER, false);
            console.log("Revoked the legacy controller's operator approval");
        }
        vm.stopBroadcast();

        console.log("borrowerlist + lenderlist now owned by the registry at %s", registry);
    }
}
