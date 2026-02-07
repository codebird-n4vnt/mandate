// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {ArcController} from "../src/ArcContract.sol";

contract ARCScript is Script {
    ArcController public c;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        c = new ArcController(0x3600000000000000000000000000000000000000,0x5DD8F8088eC3aEfd3eAC80C4655FB916856eE361);

        vm.stopBroadcast();
    }
}
