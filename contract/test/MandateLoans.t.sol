// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MandateLoans} from "../src/MandateLoans.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract MandateLoansTest is Test {
    MockUSDC usdc;
    MandateLoans loans;

    address admin = makeAddr("admin");
    address treasury = makeAddr("treasury");
    address lender = makeAddr("lender");
    address borrower = makeAddr("borrower");
    address stranger = makeAddr("stranger");

    uint128 constant PRINCIPAL = 10_000e6;
    uint16 constant APR = 1_200; // 12%
    uint32 constant TERM = 365;

    function setUp() public {
        usdc = new MockUSDC();
        loans = new MandateLoans(IERC20(address(usdc)), treasury, 100, admin);

        usdc.mint(lender, 1_000_000e6);
        usdc.mint(borrower, 100_000e6);
        usdc.mint(stranger, 100_000e6);
        vm.prank(lender);
        usdc.approve(address(loans), type(uint256).max);
        vm.prank(borrower);
        usdc.approve(address(loans), type(uint256).max);
        vm.prank(stranger);
        usdc.approve(address(loans), type(uint256).max);
    }

    function _offer() internal returns (uint256 id) {
        vm.prank(lender);
        id = loans.offer(borrower, PRINCIPAL, APR, TERM);
    }

    function _active() internal returns (uint256 id) {
        id = _offer();
        vm.prank(borrower);
        loans.accept(id);
    }

    // ---------------------------------------------------------------- offer

    function test_offer_escrowsPrincipal() public {
        uint256 before = usdc.balanceOf(lender);
        vm.expectEmit(address(loans));
        emit MandateLoans.LoanOffered(0, lender, borrower, PRINCIPAL, APR, TERM, 100);
        uint256 id = _offer();

        assertEq(id, 0);
        assertEq(usdc.balanceOf(lender), before - PRINCIPAL);
        assertEq(usdc.balanceOf(address(loans)), PRINCIPAL);

        MandateLoans.Loan memory loan = loans.getLoan(id);
        assertEq(loan.lender, lender);
        assertEq(loan.borrower, borrower);
        assertEq(loan.principal, PRINCIPAL);
        assertEq(loan.repaid, 0);
        assertEq(loan.aprBps, APR);
        assertEq(loan.feeBps, 100);
        assertEq(loan.termDays, TERM);
        assertEq(loan.offeredAt, block.timestamp);
        assertEq(loan.startedAt, 0);
        assertEq(uint8(loan.status), uint8(MandateLoans.Status.Offered));

        assertEq(loans.loanCount(), 1);
        assertEq(loans.loansOfLender(lender).length, 1);
        assertEq(loans.loansOfBorrower(borrower)[0], id);
        assertEq(loans.outstanding(id), 0, "nothing outstanding before acceptance");
        assertEq(loans.dueAt(id), 0);
    }

    function test_revert_offer_badParameters() public {
        vm.startPrank(lender);
        vm.expectRevert(MandateLoans.InvalidBorrower.selector);
        loans.offer(address(0), PRINCIPAL, APR, TERM);
        vm.expectRevert(MandateLoans.InvalidBorrower.selector);
        loans.offer(lender, PRINCIPAL, APR, TERM);
        vm.expectRevert(MandateLoans.InvalidPrincipal.selector);
        loans.offer(borrower, 0, APR, TERM);
        vm.expectRevert(MandateLoans.InvalidApr.selector);
        loans.offer(borrower, PRINCIPAL, 10_001, TERM);
        vm.expectRevert(MandateLoans.InvalidTerm.selector);
        loans.offer(borrower, PRINCIPAL, APR, 0);
        vm.expectRevert(MandateLoans.InvalidTerm.selector);
        loans.offer(borrower, PRINCIPAL, APR, 3651);
        vm.stopPrank();
    }

    function test_revert_offer_withoutAllowance() public {
        vm.prank(lender);
        usdc.approve(address(loans), 0);
        vm.prank(lender);
        vm.expectRevert();
        loans.offer(borrower, PRINCIPAL, APR, TERM);
    }

    // ---------------------------------------------------------------- accept / decline / cancel

    function test_accept_paysBorrowerLessFee() public {
        uint256 id = _offer();
        uint256 before = usdc.balanceOf(borrower);

        vm.expectEmit(address(loans));
        emit MandateLoans.LoanAccepted(id, 100e6, block.timestamp + 365 days);
        vm.prank(borrower);
        loans.accept(id);

        assertEq(usdc.balanceOf(borrower), before + 9_900e6);
        assertEq(usdc.balanceOf(treasury), 100e6);
        assertEq(usdc.balanceOf(address(loans)), 0);

        MandateLoans.Loan memory loan = loans.getLoan(id);
        assertEq(uint8(loan.status), uint8(MandateLoans.Status.Active));
        assertEq(loan.startedAt, block.timestamp);
        assertEq(loans.dueAt(id), block.timestamp + 365 days);
        assertEq(loans.amountDue(id), 11_200e6, "12% for a year");
        assertEq(loans.outstanding(id), 11_200e6);
        assertEq(loans.totalOriginated(), PRINCIPAL);
    }

    function test_accept_withZeroFee() public {
        vm.prank(admin);
        loans.setFeeBps(0);
        uint256 id = _offer();
        uint256 before = usdc.balanceOf(borrower);
        vm.prank(borrower);
        loans.accept(id);
        assertEq(usdc.balanceOf(borrower), before + PRINCIPAL);
        assertEq(usdc.balanceOf(treasury), 0);
    }

    function test_feeIsSnapshottedAtOffer() public {
        uint256 id = _offer();
        vm.prank(admin);
        loans.setFeeBps(500);
        vm.prank(borrower);
        loans.accept(id);
        assertEq(usdc.balanceOf(treasury), 100e6, "the 1% quoted in the offer");
    }

    function test_revert_accept_onlyBorrower_once() public {
        uint256 id = _offer();
        vm.prank(stranger);
        vm.expectRevert(MandateLoans.NotBorrower.selector);
        loans.accept(id);
        vm.prank(lender);
        vm.expectRevert(MandateLoans.NotBorrower.selector);
        loans.accept(id);

        vm.prank(borrower);
        loans.accept(id);
        vm.prank(borrower);
        vm.expectRevert(abi.encodeWithSelector(MandateLoans.WrongStatus.selector, MandateLoans.Status.Active));
        loans.accept(id);
    }

    function test_cancel_refundsLender() public {
        uint256 before = usdc.balanceOf(lender);
        uint256 id = _offer();
        vm.prank(lender);
        loans.cancel(id);
        assertEq(usdc.balanceOf(lender), before);
        assertEq(uint8(loans.getLoan(id).status), uint8(MandateLoans.Status.Cancelled));

        vm.prank(borrower);
        vm.expectRevert(abi.encodeWithSelector(MandateLoans.WrongStatus.selector, MandateLoans.Status.Cancelled));
        loans.accept(id);
    }

    function test_revert_cancel_onlyLender_onlyOffered() public {
        uint256 id = _offer();
        vm.prank(borrower);
        vm.expectRevert(MandateLoans.NotLender.selector);
        loans.cancel(id);

        vm.prank(borrower);
        loans.accept(id);
        vm.prank(lender);
        vm.expectRevert(abi.encodeWithSelector(MandateLoans.WrongStatus.selector, MandateLoans.Status.Active));
        loans.cancel(id);
    }

    function test_decline_refundsLender() public {
        uint256 before = usdc.balanceOf(lender);
        uint256 id = _offer();
        vm.prank(stranger);
        vm.expectRevert(MandateLoans.NotBorrower.selector);
        loans.decline(id);

        vm.prank(borrower);
        loans.decline(id);
        assertEq(usdc.balanceOf(lender), before);
        assertEq(uint8(loans.getLoan(id).status), uint8(MandateLoans.Status.Declined));
    }

    // ---------------------------------------------------------------- repay

    function test_repay_inInstalments() public {
        uint256 id = _active();
        uint256 lenderBefore = usdc.balanceOf(lender);

        vm.expectEmit(address(loans));
        emit MandateLoans.Repayment(id, borrower, 5_000e6, 6_200e6);
        vm.prank(borrower);
        assertEq(loans.repay(id, 5_000e6), 5_000e6);
        assertEq(loans.outstanding(id), 6_200e6);
        assertEq(uint8(loans.getLoan(id).status), uint8(MandateLoans.Status.Active));

        vm.expectEmit(address(loans));
        emit MandateLoans.LoanRepaid(id);
        vm.prank(borrower);
        loans.repay(id, 6_200e6);

        assertEq(usdc.balanceOf(lender), lenderBefore + 11_200e6, "repayments go straight to the lender");
        assertEq(loans.outstanding(id), 0);
        assertEq(loans.getLoan(id).repaid, 11_200e6);
        assertEq(uint8(loans.getLoan(id).status), uint8(MandateLoans.Status.Repaid));
        assertEq(loans.totalRepaid(), 11_200e6);
    }

    function test_repay_takesNoMoreThanOutstanding() public {
        uint256 id = _active();
        uint256 before = usdc.balanceOf(borrower);
        vm.prank(borrower);
        assertEq(loans.repay(id, 50_000e6), 11_200e6);
        assertEq(usdc.balanceOf(borrower), before - 11_200e6);
    }

    function test_repay_byAnyone() public {
        uint256 id = _active();
        vm.prank(stranger);
        loans.repay(id, 1_000e6);
        assertEq(loans.getLoan(id).repaid, 1_000e6);
    }

    function test_revert_repay_wrongStatus() public {
        uint256 id = _offer();
        vm.prank(borrower);
        vm.expectRevert(abi.encodeWithSelector(MandateLoans.WrongStatus.selector, MandateLoans.Status.Offered));
        loans.repay(id, 1);

        vm.prank(borrower);
        loans.accept(id);
        vm.prank(borrower);
        loans.repay(id, type(uint256).max);
        vm.prank(borrower);
        vm.expectRevert(abi.encodeWithSelector(MandateLoans.WrongStatus.selector, MandateLoans.Status.Repaid));
        loans.repay(id, 1);
    }

    function test_revert_repay_zero() public {
        uint256 id = _active();
        vm.prank(borrower);
        vm.expectRevert(MandateLoans.NothingToRepay.selector);
        loans.repay(id, 0);
    }

    // ---------------------------------------------------------------- views

    function test_interest() public view {
        assertEq(loans.interestFor(10_000e6, 1_200, 365), 1_200e6);
        assertEq(loans.interestFor(10_000e6, 1_200, 180), 591_780_821); // rounded down
        assertEq(loans.interestFor(10_000e6, 0, 365), 0);
        assertEq(loans.interestFor(1, 1, 1), 0);
    }

    function test_getLoans_andUnknown() public {
        _offer();
        _offer();
        uint256[] memory ids = new uint256[](2);
        ids[1] = 1;
        MandateLoans.Loan[] memory batch = loans.getLoans(ids);
        assertEq(batch.length, 2);
        assertEq(batch[1].borrower, borrower);

        vm.expectRevert(MandateLoans.UnknownLoan.selector);
        loans.getLoan(2);
    }

    // ---------------------------------------------------------------- admin

    function test_admin() public {
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        loans.setFeeBps(50);
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, stranger));
        loans.setTreasury(stranger);

        vm.startPrank(admin);
        vm.expectRevert(MandateLoans.FeeTooHigh.selector);
        loans.setFeeBps(501);
        vm.expectRevert(MandateLoans.ZeroAddress.selector);
        loans.setTreasury(address(0));
        loans.setFeeBps(250);
        loans.setTreasury(stranger);
        vm.stopPrank();

        assertEq(loans.feeBps(), 250);
        assertEq(loans.treasury(), stranger);
    }

    function test_revert_constructor() public {
        vm.expectRevert(MandateLoans.ZeroAddress.selector);
        new MandateLoans(IERC20(address(0)), treasury, 100, admin);
        vm.expectRevert(MandateLoans.ZeroAddress.selector);
        new MandateLoans(IERC20(address(usdc)), address(0), 100, admin);
        vm.expectRevert(MandateLoans.FeeTooHigh.selector);
        new MandateLoans(IERC20(address(usdc)), treasury, 501, admin);
    }

    // ---------------------------------------------------------------- fuzz

    function testFuzz_fullLifecycleConservesFunds(uint128 principal, uint16 apr, uint32 term, uint16 fee) public {
        principal = uint128(bound(principal, 1, 500_000e6));
        apr = uint16(bound(apr, 0, 10_000));
        term = uint32(bound(term, 1, 3650));
        fee = uint16(bound(fee, 0, 500));
        vm.prank(admin);
        loans.setFeeBps(fee);
        usdc.mint(borrower, 10_000_000e6);

        uint256 lender0 = usdc.balanceOf(lender);
        uint256 borrower0 = usdc.balanceOf(borrower);

        vm.prank(lender);
        uint256 id = loans.offer(borrower, principal, apr, term);
        vm.prank(borrower);
        loans.accept(id);
        vm.warp(block.timestamp + uint256(term) * 1 days);
        vm.prank(borrower);
        loans.repay(id, type(uint256).max);

        uint256 interest = loans.interestFor(principal, apr, term);
        uint256 feeAmount = (uint256(principal) * fee) / 10_000;
        assertEq(usdc.balanceOf(lender), lender0 + interest, "lender earns exactly the interest");
        assertEq(usdc.balanceOf(borrower), borrower0 - interest - feeAmount, "borrower pays interest + fee");
        assertEq(usdc.balanceOf(treasury), feeAmount);
        assertEq(usdc.balanceOf(address(loans)), 0, "nothing stuck");
        assertEq(uint8(loans.getLoan(id).status), uint8(MandateLoans.Status.Repaid));
    }
}
