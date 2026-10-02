// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";

/// @title MandateLoans
/// @notice The on-chain loan book for Mandate, settled in USDC on Arc.
///
///         1. A lender makes an offer to a borrower: principal, APR and term. The principal moves into
///            escrow here, so the offer is fully funded.
///         2. The borrower accepts (the principal, minus the protocol fee, goes straight to them) or
///            declines. The lender can cancel any offer that hasn't been accepted.
///         3. The borrower repays in one or more instalments. Repayments go straight to the lender.
///            The amount due is fixed when the offer is made: principal plus simple interest over the term.
///
///         Loans are unsecured: Mandate records the agreement and moves the money, while credit
///         assessment (KYC, AML, underwriting) happens off-chain between the two parties.
contract MandateLoans is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status {
        Offered,
        Active,
        Repaid,
        Cancelled,
        Declined
    }

    struct Loan {
        address lender;
        address borrower;
        uint128 principal;
        uint128 repaid;
        uint16 aprBps;
        uint16 feeBps;
        uint32 termDays;
        uint64 offeredAt;
        uint64 startedAt;
        Status status;
    }

    uint16 public constant MAX_FEE_BPS = 500; // 5%
    uint16 public constant MAX_APR_BPS = 10_000; // 100%
    uint32 public constant MAX_TERM_DAYS = 3650; // 10 years
    uint256 private constant BPS = 10_000;
    uint256 private constant DAYS_PER_YEAR = 365;

    IERC20 public immutable usdc;
    address public treasury;
    /// @notice Protocol fee taken from the principal when a borrower accepts. Snapshotted per offer.
    uint16 public feeBps;

    uint256 public totalOriginated;
    uint256 public totalRepaid;

    Loan[] private _loans;
    mapping(address => uint256[]) private _byLender;
    mapping(address => uint256[]) private _byBorrower;

    event LoanOffered(
        uint256 indexed id,
        address indexed lender,
        address indexed borrower,
        uint256 principal,
        uint16 aprBps,
        uint32 termDays,
        uint16 feeBps
    );
    event LoanCancelled(uint256 indexed id);
    event LoanDeclined(uint256 indexed id);
    event LoanAccepted(uint256 indexed id, uint256 fee, uint256 dueAt);
    event Repayment(uint256 indexed id, address indexed payer, uint256 amount, uint256 outstanding);
    event LoanRepaid(uint256 indexed id);
    event FeeUpdated(uint16 feeBps);
    event TreasuryUpdated(address indexed treasury);

    error ZeroAddress();
    error InvalidBorrower();
    error InvalidPrincipal();
    error InvalidApr();
    error InvalidTerm();
    error FeeTooHigh();
    error NotLender();
    error NotBorrower();
    error WrongStatus(Status status);
    error NothingToRepay();
    error UnknownLoan();

    constructor(IERC20 usdc_, address treasury_, uint16 feeBps_, address owner_) Ownable(owner_) {
        if (address(usdc_) == address(0) || treasury_ == address(0)) revert ZeroAddress();
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        usdc = usdc_;
        treasury = treasury_;
        feeBps = feeBps_;
    }

    // ---------------------------------------------------------------- lender

    /// @notice Offers a loan to `borrower`, escrowing `principal` USDC from the caller.
    ///         The caller must have approved this contract for `principal`.
    function offer(address borrower, uint128 principal, uint16 aprBps, uint32 termDays)
        external
        nonReentrant
        returns (uint256 id)
    {
        if (borrower == address(0) || borrower == msg.sender) revert InvalidBorrower();
        if (principal == 0) revert InvalidPrincipal();
        if (aprBps > MAX_APR_BPS) revert InvalidApr();
        if (termDays == 0 || termDays > MAX_TERM_DAYS) revert InvalidTerm();

        id = _loans.length;
        _loans.push(
            Loan({
                lender: msg.sender,
                borrower: borrower,
                principal: principal,
                repaid: 0,
                aprBps: aprBps,
                feeBps: feeBps,
                termDays: termDays,
                // forge-lint: disable-next-line(unsafe-typecast)
                offeredAt: uint64(block.timestamp),
                startedAt: 0,
                status: Status.Offered
            })
        );
        _byLender[msg.sender].push(id);
        _byBorrower[borrower].push(id);

        usdc.safeTransferFrom(msg.sender, address(this), principal);
        emit LoanOffered(id, msg.sender, borrower, principal, aprBps, termDays, feeBps);
    }

    /// @notice Withdraws an offer that hasn't been accepted and refunds the escrow.
    function cancel(uint256 id) external nonReentrant {
        Loan storage loan = _get(id);
        if (msg.sender != loan.lender) revert NotLender();
        if (loan.status != Status.Offered) revert WrongStatus(loan.status);
        loan.status = Status.Cancelled;
        usdc.safeTransfer(loan.lender, loan.principal);
        emit LoanCancelled(id);
    }

    // ---------------------------------------------------------------- borrower

    /// @notice Accepts an offer: the loan starts now, the borrower receives the principal minus the fee.
    function accept(uint256 id) external nonReentrant {
        Loan storage loan = _get(id);
        if (msg.sender != loan.borrower) revert NotBorrower();
        if (loan.status != Status.Offered) revert WrongStatus(loan.status);

        loan.status = Status.Active;
        // forge-lint: disable-next-line(unsafe-typecast)
        loan.startedAt = uint64(block.timestamp);
        totalOriginated += loan.principal;

        uint256 fee = (uint256(loan.principal) * loan.feeBps) / BPS;
        if (fee > 0) usdc.safeTransfer(treasury, fee);
        usdc.safeTransfer(loan.borrower, loan.principal - fee);
        emit LoanAccepted(id, fee, block.timestamp + uint256(loan.termDays) * 1 days);
    }

    /// @notice Turns an offer down and refunds the lender.
    function decline(uint256 id) external nonReentrant {
        Loan storage loan = _get(id);
        if (msg.sender != loan.borrower) revert NotBorrower();
        if (loan.status != Status.Offered) revert WrongStatus(loan.status);
        loan.status = Status.Declined;
        usdc.safeTransfer(loan.lender, loan.principal);
        emit LoanDeclined(id);
    }

    /// @notice Pays up to `amount` toward an active loan; anything above what's outstanding isn't taken.
    ///         Anyone may repay on the borrower's behalf. Funds go straight to the lender.
    /// @return paid The amount actually transferred.
    function repay(uint256 id, uint256 amount) external nonReentrant returns (uint256 paid) {
        Loan storage loan = _get(id);
        if (loan.status != Status.Active) revert WrongStatus(loan.status);

        uint256 remaining = amountDue(id) - loan.repaid;
        paid = amount < remaining ? amount : remaining;
        if (paid == 0) revert NothingToRepay();

        loan.repaid += SafeCast.toUint128(paid);
        remaining -= paid;
        totalRepaid += paid;
        if (remaining == 0) loan.status = Status.Repaid;

        usdc.safeTransferFrom(msg.sender, loan.lender, paid);
        emit Repayment(id, msg.sender, paid, remaining);
        if (remaining == 0) emit LoanRepaid(id);
    }

    // ---------------------------------------------------------------- views

    function loanCount() external view returns (uint256) {
        return _loans.length;
    }

    function getLoan(uint256 id) external view returns (Loan memory) {
        return _get(id);
    }

    function getLoans(uint256[] calldata ids) external view returns (Loan[] memory loans) {
        loans = new Loan[](ids.length);
        for (uint256 i; i < ids.length; ++i) {
            loans[i] = _get(ids[i]);
        }
    }

    function loansOfLender(address lender) external view returns (uint256[] memory) {
        return _byLender[lender];
    }

    function loansOfBorrower(address borrower) external view returns (uint256[] memory) {
        return _byBorrower[borrower];
    }

    /// @notice Interest on `principal` at `aprBps` for `termDays` (simple, 365-day year, rounded down).
    function interestFor(uint256 principal, uint16 aprBps, uint32 termDays) public pure returns (uint256) {
        return (principal * aprBps * termDays) / (BPS * DAYS_PER_YEAR);
    }

    /// @notice Principal plus interest for the full term. Fixed when the offer is made.
    function amountDue(uint256 id) public view returns (uint256) {
        Loan storage loan = _get(id);
        return uint256(loan.principal) + interestFor(loan.principal, loan.aprBps, loan.termDays);
    }

    function outstanding(uint256 id) external view returns (uint256) {
        Loan storage loan = _get(id);
        if (loan.status != Status.Active) return 0;
        return amountDue(id) - loan.repaid;
    }

    /// @notice When an active loan falls due; 0 if it hasn't started.
    function dueAt(uint256 id) external view returns (uint256) {
        Loan storage loan = _get(id);
        return loan.startedAt == 0 ? 0 : uint256(loan.startedAt) + uint256(loan.termDays) * 1 days;
    }

    // ---------------------------------------------------------------- admin

    function setFeeBps(uint16 feeBps_) external onlyOwner {
        if (feeBps_ > MAX_FEE_BPS) revert FeeTooHigh();
        feeBps = feeBps_;
        emit FeeUpdated(feeBps_);
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function _get(uint256 id) private view returns (Loan storage) {
        // forge-lint: disable-next-line(require-revert-in-loop)
        if (id >= _loans.length) revert UnknownLoan();
        return _loans[id];
    }
}
