// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {console} from "forge-std/Script.sol";
import {MandateScript} from "../Base.s.sol";
import {MandateRegistry} from "../../src/MandateRegistry.sol";

/// @notice Local development only: registers three lenders (anvil accounts 2-4) and three borrowers
///         (accounts 5-7) so the market has something to match. Accounts 0 and 1 stay profile-free.
///
///   REGISTRY=0x... forge script script/local/SeedProfiles.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
contract SeedProfiles is MandateScript {
    string internal constant MNEMONIC = "test test test test test test test test test test test junk";

    struct Seed {
        uint32 account;
        MandateRegistry.Role role;
        string label;
        string display;
        string description;
        string roi;
        string loanType;
        string industry;
        string location;
        string tenure;
        string amount;
    }

    function run() external {
        MandateRegistry registry = MandateRegistry(vm.envAddress("REGISTRY"));
        Seed[6] memory seeds = [
            Seed(
                2,
                MandateRegistry.Role.Lender,
                "northwind-capital",
                "Northwind Capital",
                "Revenue-based credit for profitable SaaS companies.",
                "10-15",
                "Business",
                "IT Services & SaaS",
                "India",
                "24",
                "250000"
            ),
            Seed(
                3,
                MandateRegistry.Role.Lender,
                "monsoon-credit",
                "Monsoon Credit Fund",
                "Working-capital lines for agriculture and food supply chains.",
                "15-20",
                "Business",
                "Agriculture & Allied Industries",
                "India",
                "18",
                "100000"
            ),
            Seed(
                4,
                MandateRegistry.Role.Lender,
                "harbor-lane",
                "Harbor Lane Partners",
                "Senior debt for real-estate and infrastructure projects.",
                "5-10",
                "Mortgage",
                "Any",
                "Any",
                "48",
                "1000000"
            ),
            Seed(
                5,
                MandateRegistry.Role.Borrower,
                "acme-robotics",
                "Acme Robotics",
                "Warehouse-automation SaaS at $1.4M ARR, expanding to the Gulf.",
                "10-15",
                "Business",
                "IT Services & SaaS",
                "India",
                "24",
                "150000"
            ),
            Seed(
                6,
                MandateRegistry.Role.Borrower,
                "greenleaf-agro",
                "Greenleaf Agro",
                "Cold-chain storage for smallholder farmers in Maharashtra.",
                "15-20",
                "Business",
                "Agriculture & Allied Industries",
                "India",
                "12",
                "80000"
            ),
            Seed(
                7,
                MandateRegistry.Role.Borrower,
                "skyline-homes",
                "Skyline Homes",
                "Mid-income housing developer financing its next tower.",
                "10-15",
                "Mortgage",
                "Construction, Real Estate & Infrastructure",
                "Singapore",
                "36",
                "600000"
            )
        ];

        for (uint256 i; i < seeds.length; ++i) {
            Seed memory s = seeds[i];
            string[] memory keys = new string[](8);
            string[] memory values = new string[](8);
            (keys[0], values[0]) = ("display", s.display);
            (keys[1], values[1]) = ("description", s.description);
            (keys[2], values[2]) = ("mandate.roi", s.roi);
            (keys[3], values[3]) = ("mandate.loanType", s.loanType);
            (keys[4], values[4]) = ("mandate.industry", s.industry);
            (keys[5], values[5]) = ("location", s.location);
            (keys[6], values[6]) = ("mandate.tenure", s.tenure);
            (keys[7], values[7]) = ("mandate.amount", s.amount);

            vm.startBroadcast(vm.deriveKey(MNEMONIC, s.account));
            registry.register(s.role, s.label, keys, values);
            vm.stopBroadcast();
            console.log("  %s", s.label);
        }
    }
}
