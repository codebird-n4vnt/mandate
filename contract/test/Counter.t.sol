// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ENSController} from "../src/EnsContract.sol";

contract CounterTest is Test {
    ENSController public c;

    function setUp() public {
        c = new ENSController();
    }

}
