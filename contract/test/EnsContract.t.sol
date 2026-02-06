// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {ENSController} from "../src/EnsContract.sol";

contract CounterTest is Test {
    ENSController public c;

    function setUp() public {
        c = new ENSController(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    }

    function testLabelhash() public {
        vm.prank(0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25);
        c.createSubdomain('0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25', 0x0DE713f39d53AD3e7086D8d7ba61E2b4b8B67a25);

        bytes32 value = c.labelHash();

        assertEq(value,0x110ac1f902a44a2d5b3012da0942cb5a2300aa483e3ffacccfa600e8464d5dc6, "same" );
    }

}
