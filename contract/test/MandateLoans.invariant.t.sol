// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MandateLoans} from "../src/MandateLoans.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

/// @dev Drives random offers, cancels, declines, accepts and repayments between a few actors.
contract LoansHandler is Test {
    MandateLoans public loans;
    MockUSDC public usdc;
    address[] public actors;

    constructor(MandateLoans loans_, MockUSDC usdc_) {
        loans = loans_;
        usdc = usdc_;
        for (uint256 i; i < 4; ++i) {
            address actor = makeAddr(string(abi.encodePacked("actor", vm.toString(i))));
            actors.push(actor);
            usdc.mint(actor, 1_000_000_000e6);
            vm.prank(actor);
            usdc.approve(address(loans), type(uint256).max);
        }
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function _loanId(uint256 seed) internal view returns (bool, uint256) {
        uint256 count = loans.loanCount();
        if (count == 0) return (false, 0);
        return (true, seed % count);
    }

    function offer(uint256 lenderSeed, uint256 borrowerSeed, uint128 principal, uint16 apr, uint32 term) external {
        address lender = _actor(lenderSeed);
        address borrower = _actor(borrowerSeed);
        if (lender == borrower) borrower = _actor(borrowerSeed + 1);
        principal = uint128(bound(principal, 1, 1_000_000e6));
        apr = uint16(bound(apr, 0, 10_000));
        term = uint32(bound(term, 1, 3650));
        vm.prank(lender);
        loans.offer(borrower, principal, apr, term);
    }

    function cancel(uint256 seed) external {
        (bool ok, uint256 id) = _loanId(seed);
        if (!ok) return;
        MandateLoans.Loan memory loan = loans.getLoan(id);
        if (loan.status != MandateLoans.Status.Offered) return;
        vm.prank(loan.lender);
        loans.cancel(id);
    }

    function decline(uint256 seed) external {
        (bool ok, uint256 id) = _loanId(seed);
        if (!ok) return;
        MandateLoans.Loan memory loan = loans.getLoan(id);
        if (loan.status != MandateLoans.Status.Offered) return;
        vm.prank(loan.borrower);
        loans.decline(id);
    }

    function accept(uint256 seed) external {
        (bool ok, uint256 id) = _loanId(seed);
        if (!ok) return;
        MandateLoans.Loan memory loan = loans.getLoan(id);
        if (loan.status != MandateLoans.Status.Offered) return;
        vm.prank(loan.borrower);
        loans.accept(id);
    }

    function repay(uint256 seed, uint256 payerSeed, uint256 amount) external {
        (bool ok, uint256 id) = _loanId(seed);
        if (!ok) return;
        if (loans.getLoan(id).status != MandateLoans.Status.Active) return;
        amount = bound(amount, 1, 2_000_000e6);
        vm.prank(_actor(payerSeed));
        loans.repay(id, amount);
    }

    function warp(uint32 secondsAhead) external {
        vm.warp(block.timestamp + bound(secondsAhead, 0, 400 days));
    }
}

contract MandateLoansInvariantTest is Test {
    MandateLoans loans;
    MockUSDC usdc;
    LoansHandler handler;

    function setUp() public {
        usdc = new MockUSDC();
        loans = new MandateLoans(IERC20(address(usdc)), makeAddr("treasury"), 100, address(this));
        handler = new LoansHandler(loans, usdc);
        targetContract(address(handler));
    }

    /// The contract only ever holds the escrow of open offers.
    function invariant_escrowEqualsOpenOffers() public view {
        uint256 escrow;
        uint256 count = loans.loanCount();
        for (uint256 id; id < count; ++id) {
            MandateLoans.Loan memory loan = loans.getLoan(id);
            if (loan.status == MandateLoans.Status.Offered) escrow += loan.principal;
        }
        assertEq(usdc.balanceOf(address(loans)), escrow);
    }

    /// Repaid never exceeds what is due, and a loan is Repaid exactly when it is fully paid.
    function invariant_repaymentAccounting() public view {
        uint256 count = loans.loanCount();
        uint256 sumRepaid;
        uint256 sumOriginated;
        for (uint256 id; id < count; ++id) {
            MandateLoans.Loan memory loan = loans.getLoan(id);
            uint256 due = loans.amountDue(id);
            assertLe(loan.repaid, due);
            if (loan.status == MandateLoans.Status.Repaid) assertEq(loan.repaid, due);
            if (loan.status == MandateLoans.Status.Active) assertLt(loan.repaid, due);
            if (loan.status == MandateLoans.Status.Active || loan.status == MandateLoans.Status.Repaid) {
                sumOriginated += loan.principal;
            }
            sumRepaid += loan.repaid;
        }
        assertEq(loans.totalRepaid(), sumRepaid);
        assertEq(loans.totalOriginated(), sumOriginated);
    }
}
