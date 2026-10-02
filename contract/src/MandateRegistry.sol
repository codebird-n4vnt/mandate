// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {IENS, IPublicResolver} from "./interfaces/IENS.sol";

/// @title MandateRegistry
/// @notice Issues the ENS subnames that hold Mandate profiles:
///         `<label>.borrowerlist.n4vnt.eth` for borrowers and `<label>.lenderlist.n4vnt.eth` for lenders.
///
///         A profile's lending intent (ROI band, loan type, industry, location, tenure, amount) lives in
///         the subname's ENS text records, so any ENS-aware app can read it. The registry also keeps an
///         on-chain directory of every profile, so the app can list them without an indexer.
///
///         Registration is one transaction: the registry creates the subname, points it at the public
///         resolver, writes the caller's address and text records, then hands ownership to the caller.
///         From then on the caller edits their records directly on the resolver.
///
/// @dev    The registry must own both root nodes in the ENS registry. It never touches any other name,
///         never reassigns a subname that already exists, and never accepts a caller-supplied parent node.
contract MandateRegistry is Ownable2Step {
    enum Role {
        Borrower,
        Lender
    }

    struct Profile {
        address account;
        string label;
    }

    /// @notice Most text records that can be written while registering.
    uint256 public constant MAX_RECORDS = 16;
    uint256 public constant MIN_LABEL_LENGTH = 3;
    uint256 public constant MAX_LABEL_LENGTH = 32;

    IENS public immutable ens;
    IPublicResolver public immutable resolver;
    bytes32 public immutable borrowerRoot;
    bytes32 public immutable lenderRoot;

    mapping(Role => Profile[]) private _profiles;
    /// @dev 1-based index into `_profiles[role]`; 0 means "no profile".
    mapping(Role => mapping(address => uint256)) private _indexPlusOne;

    event ProfileRegistered(Role indexed role, address indexed account, bytes32 indexed node, string label);
    event RootReleased(Role indexed role, address indexed to);

    error AlreadyRegistered();
    error InvalidLabel();
    error LabelTaken();
    error TooManyRecords();
    error LengthMismatch();
    error ZeroAddress();

    constructor(IENS ens_, IPublicResolver resolver_, bytes32 borrowerRoot_, bytes32 lenderRoot_, address owner_)
        Ownable(owner_)
    {
        if (address(ens_) == address(0) || address(resolver_) == address(0)) revert ZeroAddress();
        ens = ens_;
        resolver = resolver_;
        borrowerRoot = borrowerRoot_;
        lenderRoot = lenderRoot_;
    }

    // ---------------------------------------------------------------- registration

    /// @notice Creates `<label>.<role root>` for the caller and writes its text records.
    /// @param role   Borrower or Lender. Each address can hold one profile per role.
    /// @param label  3-32 characters of `a-z`, `0-9` and `-` (not leading, trailing, or at positions 3-4).
    /// @param keys   Text record keys, e.g. `mandate.roi`. At most `MAX_RECORDS`.
    /// @param values Text record values, same length as `keys`.
    /// @return node  The ENS namehash of the new profile.
    function register(Role role, string calldata label, string[] calldata keys, string[] calldata values)
        external
        returns (bytes32 node)
    {
        if (_indexPlusOne[role][msg.sender] != 0) revert AlreadyRegistered();
        if (!isValidLabel(label)) revert InvalidLabel();
        if (keys.length != values.length) revert LengthMismatch();
        if (keys.length > MAX_RECORDS) revert TooManyRecords();

        bytes32 root = rootOf(role);
        bytes32 labelHash = keccak256(bytes(label));
        node = keccak256(abi.encodePacked(root, labelHash));
        if (ens.owner(node) != address(0)) revert LabelTaken();

        _profiles[role].push(Profile({account: msg.sender, label: label}));
        _indexPlusOne[role][msg.sender] = _profiles[role].length;
        emit ProfileRegistered(role, msg.sender, node, label);

        // Own the subname for the length of this call so the resolver accepts our writes.
        // The ENS registry and resolver are fixed at deployment.
        ens.setSubnodeRecord(root, labelHash, address(this), address(resolver), 0);
        resolver.setAddr(node, msg.sender);
        for (uint256 i; i < keys.length; ++i) {
            // forge-lint: disable-next-line(calls-loop)
            resolver.setText(node, keys[i], values[i]);
        }
        ens.setOwner(node, msg.sender);
    }

    // ---------------------------------------------------------------- views

    function rootOf(Role role) public view returns (bytes32) {
        return role == Role.Borrower ? borrowerRoot : lenderRoot;
    }

    function nodeOf(Role role, string calldata label) external view returns (bytes32) {
        return keccak256(abi.encodePacked(rootOf(role), keccak256(bytes(label))));
    }

    function profileCount(Role role) external view returns (uint256) {
        return _profiles[role].length;
    }

    /// @notice A page of the directory, in registration order.
    function getProfiles(Role role, uint256 start, uint256 limit) external view returns (Profile[] memory page) {
        Profile[] storage all = _profiles[role];
        if (start >= all.length) return new Profile[](0);
        uint256 end = start + limit;
        if (end > all.length) end = all.length;
        page = new Profile[](end - start);
        for (uint256 i = start; i < end; ++i) {
            page[i - start] = all[i];
        }
    }

    /// @notice The caller's profile label for `role`, or "" if they have none.
    function labelOf(Role role, address account) external view returns (string memory) {
        uint256 i = _indexPlusOne[role][account];
        return i == 0 ? "" : _profiles[role][i - 1].label;
    }

    /// @notice Whether `label` can be registered under `role` right now.
    function isAvailable(Role role, string calldata label) external view returns (bool) {
        if (!isValidLabel(label)) return false;
        return ens.owner(keccak256(abi.encodePacked(rootOf(role), keccak256(bytes(label))))) == address(0);
    }

    /// @notice ENSIP-15-safe subset: lowercase ASCII letters, digits and hyphens.
    function isValidLabel(string calldata label) public pure returns (bool) {
        bytes calldata b = bytes(label);
        uint256 len = b.length;
        if (len < MIN_LABEL_LENGTH || len > MAX_LABEL_LENGTH) return false;
        if (b[0] == "-" || b[len - 1] == "-") return false;
        // ENSIP-15 rejects ASCII labels with hyphens in positions 3 and 4 ("xn--" style).
        if (len >= 4 && b[2] == "-" && b[3] == "-") return false;
        for (uint256 i; i < len; ++i) {
            bytes1 c = b[i];
            bool ok = (c >= "a" && c <= "z") || (c >= "0" && c <= "9") || c == "-";
            if (!ok) return false;
        }
        return true;
    }

    // ---------------------------------------------------------------- admin

    /// @notice Hands a root node to `to`, e.g. when migrating to a new registry. Registration under
    ///         that root stops working until the root is handed back.
    function releaseRoot(Role role, address to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        emit RootReleased(role, to);
        ens.setOwner(rootOf(role), to);
    }
}
