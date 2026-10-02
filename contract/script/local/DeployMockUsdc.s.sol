// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MandateScript} from "../Base.s.sol";
import {MockUSDC} from "../../test/mocks/MockUSDC.sol";

/// @notice Local development only: a mintable 6-decimal USDC, with 1,000,000 minted to each of
///         anvil's first ten accounts. Arc's real USDC can't run on an anvil fork (it is backed by
///         Arc's native balance), so the local Arc chain uses this instead.
contract DeployMockUsdc is MandateScript {
    function run() external returns (MockUSDC usdc) {
        vm.startBroadcast();
        usdc = new MockUSDC();
        for (uint256 i; i < 10; ++i) {
            uint256 key = vm.deriveKey("test test test test test test test test test test test junk", uint32(i));
            usdc.mint(vm.addr(key), 1_000_000e6);
        }
        vm.stopBroadcast();
        _record("usdc", address(usdc));
    }
}
