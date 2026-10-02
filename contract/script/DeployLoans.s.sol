// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MandateScript} from "./Base.s.sol";
import {MandateLoans} from "../src/MandateLoans.sol";

/// @notice Deploys the loan book on Arc testnet (gas is paid in USDC: https://faucet.circle.com).
///
///   forge script script/DeployLoans.s.sol --rpc-url arc --account <wallet> --broadcast
///
/// Optional env: USDC (defaults to Arc's), TREASURY and OWNER (default to the deployer), FEE_BPS (default 100 = 1%).
contract DeployLoans is MandateScript {
    function run() external returns (MandateLoans loans) {
        address usdc = vm.envOr("USDC", ARC_USDC);
        uint256 feeBps = vm.envOr("FEE_BPS", uint256(100));
        require(feeBps <= type(uint16).max, "FEE_BPS out of range");

        vm.startBroadcast();
        address deployer = _broadcaster();
        loans = new MandateLoans(
            IERC20(usdc),
            vm.envOr("TREASURY", deployer),
            // forge-lint: disable-next-line(unsafe-typecast)
            uint16(feeBps),
            vm.envOr("OWNER", deployer)
        );
        vm.stopBroadcast();

        console.log("MandateLoans deployed on chain %s", block.chainid);
        _record("loans", address(loans));
        _record("usdc", usdc);
        _recordUint("loansBlock", block.number);
    }
}
