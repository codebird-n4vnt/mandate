// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MandateRegistry} from "../src/MandateRegistry.sol";
import {IENS, IPublicResolver} from "../src/interfaces/IENS.sol";
import {MockENSRegistry, MockPublicResolver} from "./mocks/MockENS.sol";

contract MandateRegistryTest is Test {
    MockENSRegistry ens;
    MockPublicResolver resolver;
    MandateRegistry registry;

    address rootOwner = makeAddr("rootOwner");
    address admin = makeAddr("admin");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    bytes32 n4vntNode;
    bytes32 borrowerRoot;
    bytes32 lenderRoot;

    MandateRegistry.Role constant BORROWER = MandateRegistry.Role.Borrower;
    MandateRegistry.Role constant LENDER = MandateRegistry.Role.Lender;

    function setUp() public {
        ens = new MockENSRegistry();
        resolver = new MockPublicResolver(ens);

        bytes32 ethNode = ens.setSubnodeOwner(bytes32(0), keccak256("eth"), address(this));
        n4vntNode = ens.setSubnodeOwner(ethNode, keccak256("n4vnt"), rootOwner);
        vm.startPrank(rootOwner);
        borrowerRoot = ens.setSubnodeOwner(n4vntNode, keccak256("borrowerlist"), rootOwner);
        lenderRoot = ens.setSubnodeOwner(n4vntNode, keccak256("lenderlist"), rootOwner);
        vm.stopPrank();

        registry = new MandateRegistry(
            IENS(address(ens)), IPublicResolver(address(resolver)), borrowerRoot, lenderRoot, admin
        );

        vm.startPrank(rootOwner);
        ens.setOwner(borrowerRoot, address(registry));
        ens.setOwner(lenderRoot, address(registry));
        vm.stopPrank();
    }

    function _records() internal pure returns (string[] memory keys, string[] memory values) {
        keys = new string[](3);
        values = new string[](3);
        (keys[0], values[0]) = ("mandate.roi", "10-15");
        (keys[1], values[1]) = ("mandate.loanType", "Business");
        (keys[2], values[2]) = ("location", "India");
    }

    function _register(address who, MandateRegistry.Role role, string memory label) internal returns (bytes32) {
        (string[] memory keys, string[] memory values) = _records();
        vm.prank(who);
        return registry.register(role, label, keys, values);
    }

    // ---------------------------------------------------------------- setup sanity

    function test_rootsMatchTheLiveNamehashes() public view {
        // namehash("borrowerlist.n4vnt.eth") and namehash("lenderlist.n4vnt.eth"), as used on Sepolia.
        assertEq(borrowerRoot, 0x8f7d6f386b899e662d8ffffe5abf1a017bb202edf791763fa27a41cc06e21521);
        assertEq(lenderRoot, 0xa7af8f7962f3c01f31d162b75a49751bb0889c560e8c384b10cf121be57b15b8);
    }

    // ---------------------------------------------------------------- register

    function test_register_givesCallerTheSubnameWithRecords() public {
        bytes32 node = _register(alice, BORROWER, "acme");

        assertEq(node, keccak256(abi.encodePacked(borrowerRoot, keccak256("acme"))));
        assertEq(node, registry.nodeOf(BORROWER, "acme"));
        assertEq(ens.owner(node), alice, "caller owns the subname");
        assertEq(ens.resolver(node), address(resolver));
        assertEq(resolver.addr(node), alice, "name resolves to the caller");
        assertEq(resolver.text(node, "mandate.roi"), "10-15");
        assertEq(resolver.text(node, "mandate.loanType"), "Business");
        assertEq(resolver.text(node, "location"), "India");
    }

    function test_register_emitsEvent() public {
        bytes32 node = keccak256(abi.encodePacked(lenderRoot, keccak256("fund-one")));
        vm.expectEmit(address(registry));
        emit MandateRegistry.ProfileRegistered(LENDER, bob, node, "fund-one");
        _register(bob, LENDER, "fund-one");
    }

    function test_register_withNoRecords() public {
        vm.prank(alice);
        bytes32 node = registry.register(LENDER, "quiet", new string[](0), new string[](0));
        assertEq(ens.owner(node), alice);
        assertEq(resolver.addr(node), alice);
    }

    function test_directory_listsProfilesInOrder() public {
        _register(alice, BORROWER, "acme");
        _register(bob, BORROWER, "bobco");
        _register(bob, LENDER, "bob-capital");

        assertEq(registry.profileCount(BORROWER), 2);
        assertEq(registry.profileCount(LENDER), 1);

        MandateRegistry.Profile[] memory page = registry.getProfiles(BORROWER, 0, 10);
        assertEq(page.length, 2);
        assertEq(page[0].account, alice);
        assertEq(page[0].label, "acme");
        assertEq(page[1].account, bob);
        assertEq(page[1].label, "bobco");

        page = registry.getProfiles(BORROWER, 1, 10);
        assertEq(page.length, 1);
        assertEq(page[0].label, "bobco");

        assertEq(registry.getProfiles(BORROWER, 2, 10).length, 0);
        assertEq(registry.getProfiles(BORROWER, 0, 1).length, 1);

        assertEq(registry.labelOf(BORROWER, bob), "bobco");
        assertEq(registry.labelOf(LENDER, bob), "bob-capital");
        assertEq(registry.labelOf(LENDER, alice), "");
    }

    function test_sameLabelUnderBothRoots() public {
        _register(alice, BORROWER, "acme");
        _register(bob, LENDER, "acme");
        assertEq(ens.owner(registry.nodeOf(BORROWER, "acme")), alice);
        assertEq(ens.owner(registry.nodeOf(LENDER, "acme")), bob);
    }

    function test_ownerEditsRecordsDirectlyAfterwards() public {
        bytes32 node = _register(alice, BORROWER, "acme");
        vm.prank(alice);
        resolver.setText(node, "mandate.roi", "15-20");
        assertEq(resolver.text(node, "mandate.roi"), "15-20");

        vm.prank(address(registry));
        vm.expectRevert("Resolver: unauthorised");
        resolver.setText(node, "mandate.roi", "5-10");
    }

    function test_revert_secondProfileForSameRole() public {
        _register(alice, BORROWER, "acme");
        (string[] memory keys, string[] memory values) = _records();
        vm.prank(alice);
        vm.expectRevert(MandateRegistry.AlreadyRegistered.selector);
        registry.register(BORROWER, "acme-two", keys, values);
    }

    function test_revert_takenLabel_cannotHijack() public {
        bytes32 node = _register(alice, BORROWER, "acme");
        (string[] memory keys, string[] memory values) = _records();
        vm.prank(bob);
        vm.expectRevert(MandateRegistry.LabelTaken.selector);
        registry.register(BORROWER, "acme", keys, values);
        assertEq(ens.owner(node), alice);
    }

    function test_revert_labelThatExistedBeforeTheRegistry() public {
        // A subname created by the old controller (or by hand) must never be reassigned.
        vm.prank(admin);
        registry.releaseRoot(BORROWER, rootOwner);
        vm.prank(rootOwner);
        ens.setSubnodeOwner(borrowerRoot, keccak256("6acb"), bob);
        vm.prank(rootOwner);
        ens.setOwner(borrowerRoot, address(registry));

        assertFalse(registry.isAvailable(BORROWER, "6acb"));
        (string[] memory keys, string[] memory values) = _records();
        vm.prank(alice);
        vm.expectRevert(MandateRegistry.LabelTaken.selector);
        registry.register(BORROWER, "6acb", keys, values);
    }

    function test_revert_lengthMismatch() public {
        vm.prank(alice);
        vm.expectRevert(MandateRegistry.LengthMismatch.selector);
        registry.register(BORROWER, "acme", new string[](2), new string[](1));
    }

    function test_revert_tooManyRecords() public {
        uint256 n = registry.MAX_RECORDS() + 1;
        vm.prank(alice);
        vm.expectRevert(MandateRegistry.TooManyRecords.selector);
        registry.register(BORROWER, "acme", new string[](n), new string[](n));
    }

    function test_revert_withoutRootOwnership() public {
        vm.prank(admin);
        registry.releaseRoot(LENDER, rootOwner);
        assertEq(ens.owner(lenderRoot), rootOwner);

        (string[] memory keys, string[] memory values) = _records();
        vm.prank(alice);
        vm.expectRevert("ENS: unauthorised");
        registry.register(LENDER, "acme", keys, values);
    }

    // ---------------------------------------------------------------- labels

    function test_validLabels() public view {
        assertTrue(registry.isValidLabel("abc"));
        assertTrue(registry.isValidLabel("a-b"));
        assertTrue(registry.isValidLabel("123"));
        assertTrue(registry.isValidLabel("acme-capital-2026"));
        assertTrue(registry.isValidLabel("abcdefghijklmnopqrstuvwxyz012345")); // 32
    }

    function test_invalidLabels() public view {
        assertFalse(registry.isValidLabel(""));
        assertFalse(registry.isValidLabel("ab"));
        assertFalse(registry.isValidLabel("abcdefghijklmnopqrstuvwxyz0123456")); // 33
        assertFalse(registry.isValidLabel("-abc"));
        assertFalse(registry.isValidLabel("abc-"));
        assertFalse(registry.isValidLabel("xn--abc"));
        assertFalse(registry.isValidLabel("ab--"));
        assertFalse(registry.isValidLabel("Acme"));
        assertFalse(registry.isValidLabel("a.b.c"));
        assertFalse(registry.isValidLabel("a b c"));
        assertFalse(registry.isValidLabel("acme_co"));
        assertFalse(registry.isValidLabel(unicode"café"));
    }

    function test_revert_invalidLabel() public {
        (string[] memory keys, string[] memory values) = _records();
        vm.prank(alice);
        vm.expectRevert(MandateRegistry.InvalidLabel.selector);
        registry.register(BORROWER, "Bad.Label", keys, values);
    }

    function test_isAvailable() public {
        assertTrue(registry.isAvailable(BORROWER, "acme"));
        assertFalse(registry.isAvailable(BORROWER, "no"));
        _register(alice, BORROWER, "acme");
        assertFalse(registry.isAvailable(BORROWER, "acme"));
        assertTrue(registry.isAvailable(LENDER, "acme"));
    }

    function testFuzz_registerAnyValidLabel(uint256 seed, uint8 rawLen) public {
        uint256 len = bound(rawLen, 3, 32);
        bytes memory alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        bytes memory label = new bytes(len);
        for (uint256 i; i < len; ++i) {
            label[i] = alphabet[uint256(keccak256(abi.encode(seed, i))) % alphabet.length];
        }
        bytes32 node = _register(alice, LENDER, string(label));
        assertEq(ens.owner(node), alice);
        assertEq(registry.labelOf(LENDER, alice), string(label));
    }

    // ---------------------------------------------------------------- admin

    function test_releaseRoot_onlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        registry.releaseRoot(BORROWER, alice);

        vm.prank(admin);
        vm.expectRevert(MandateRegistry.ZeroAddress.selector);
        registry.releaseRoot(BORROWER, address(0));

        vm.prank(admin);
        registry.releaseRoot(BORROWER, rootOwner);
        assertEq(ens.owner(borrowerRoot), rootOwner);
        assertEq(ens.owner(lenderRoot), address(registry), "other root untouched");
    }
}
