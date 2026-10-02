// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {console} from "forge-std/Script.sol";
import {MandateScript} from "./Base.s.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {IENS, IPublicResolver} from "../src/interfaces/IENS.sol";

/// @notice Deploys the ENS profile registry on Sepolia.
///
///   forge script script/DeployRegistry.s.sol --rpc-url sepolia --account <wallet> --broadcast
///
/// Then the owner of borrowerlist/lenderlist.n4vnt.eth runs HandOverRoots.s.sol.
/// Optional env: OWNER (defaults to the deployer), ENS_REGISTRY, PUBLIC_RESOLVER, BORROWER_ROOT, LENDER_ROOT.
contract DeployRegistry is MandateScript {
    function run() external returns (MandateRegistry registry) {
        vm.startBroadcast();
        address deployer = _broadcaster();
        registry = new MandateRegistry(
            IENS(vm.envOr("ENS_REGISTRY", SEPOLIA_ENS_REGISTRY)),
            IPublicResolver(vm.envOr("PUBLIC_RESOLVER", SEPOLIA_PUBLIC_RESOLVER)),
            vm.envOr("BORROWER_ROOT", BORROWER_ROOT),
            vm.envOr("LENDER_ROOT", LENDER_ROOT),
            vm.envOr("OWNER", deployer)
        );
        vm.stopBroadcast();

        console.log("MandateRegistry deployed on chain %s", block.chainid);
        _record("registry", address(registry));
        _recordUint("registryBlock", block.number);
    }
}
