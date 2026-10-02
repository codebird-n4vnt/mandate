// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MandateScript} from "../Base.s.sol";
import {MandateLoans} from "../../src/MandateLoans.sol";
import {MockUSDC} from "../../test/mocks/MockUSDC.sol";

/// @notice Local development only: a few loans between the seeded profiles, in every state.
///
///   LOANS=0x... USDC=0x... forge script script/local/SeedLoans.s.sol --rpc-url http://127.0.0.1:8546 --broadcast
contract SeedLoans is MandateScript {
    string internal constant MNEMONIC = "test test test test test test test test test test test junk";

    function run() external {
        MandateLoans loans = MandateLoans(vm.envAddress("LOANS"));
        MockUSDC usdc = MockUSDC(vm.envAddress("USDC"));

        uint256 northwind = vm.deriveKey(MNEMONIC, 2);
        uint256 monsoon = vm.deriveKey(MNEMONIC, 3);
        uint256 harbor = vm.deriveKey(MNEMONIC, 4);
        uint256 acme = vm.deriveKey(MNEMONIC, 5);
        uint256 greenleaf = vm.deriveKey(MNEMONIC, 6);
        uint256 skyline = vm.deriveKey(MNEMONIC, 7);

        // Northwind -> Acme: 150,000 at 12% for 24 months, accepted, one instalment paid.
        vm.startBroadcast(northwind);
        usdc.approve(address(loans), type(uint256).max);
        uint256 a = loans.offer(vm.addr(acme), 150_000e6, 1_200, 730);
        vm.stopBroadcast();
        vm.startBroadcast(acme);
        usdc.approve(address(loans), type(uint256).max);
        loans.accept(a);
        loans.repay(a, 20_000e6);
        vm.stopBroadcast();

        // Harbor Lane -> Skyline: 50,000 at 8% for 6 months, accepted and fully repaid.
        vm.startBroadcast(harbor);
        usdc.approve(address(loans), type(uint256).max);
        uint256 b = loans.offer(vm.addr(skyline), 50_000e6, 800, 183);
        vm.stopBroadcast();
        vm.startBroadcast(skyline);
        usdc.approve(address(loans), type(uint256).max);
        loans.accept(b);
        loans.repay(b, type(uint256).max);
        vm.stopBroadcast();

        // Monsoon -> Greenleaf: 80,000 at 16.5% for 12 months, waiting for Greenleaf to accept.
        vm.startBroadcast(monsoon);
        usdc.approve(address(loans), type(uint256).max);
        loans.offer(vm.addr(greenleaf), 80_000e6, 1_650, 365);
        vm.stopBroadcast();
    }
}
