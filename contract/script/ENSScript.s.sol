// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ENSController} from "../src/EnsContract.sol";

contract ENSScript is Script {
    ENSController public c;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        c = new ENSController(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);

        vm.stopBroadcast();
    }
}
