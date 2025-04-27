// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../pond.sol";

contract PondTest {
    Pond public pond;
    address public user1;
    address public user2;

    event TestEvent(bool passed, string message);

    constructor(address _pondAddress) {
        pond = Pond(_pondAddress);
        user1 = address(1);
        user2 = address(2);
    }

    function testInitialReputation() public {
        Pond.RepScores memory scores = pond.getReputation(user1);
        require(scores.defi == 0, "Initial DeFi score should be 0");
        require(scores.governance == 0, "Initial Governance score should be 0");
        require(scores.social == 0, "Initial Social score should be 0");
        emit TestEvent(true, "Initial reputation test passed");
    }

    function testUpdateReputation() public {
        pond.updateReputation(user1, Pond.Category.DeFi, 50);
        Pond.RepScores memory scores = pond.getReputation(user1);
        require(scores.defi == 50, "DeFi score should be 50");
        emit TestEvent(true, "Update reputation test passed");
    }

    function testMultiBoostReputation() public {
        Pond.Category[] memory categories = new Pond.Category[](3);
        uint256[] memory amounts = new uint256[](3);
        
        categories[0] = Pond.Category.DeFi;
        categories[1] = Pond.Category.Governance;
        categories[2] = Pond.Category.Social;
        
        amounts[0] = 10;
        amounts[1] = 20;
        amounts[2] = 30;
        
        pond.multiBoostReputation(user1, categories, amounts);
        Pond.RepScores memory scores = pond.getReputation(user1);
        
        require(scores.defi == 10, "DeFi score should be 10");
        require(scores.governance == 20, "Governance score should be 20");
        require(scores.social == 30, "Social score should be 30");
        emit TestEvent(true, "Multi-boost reputation test passed");
    }

    function testDecayReputation() public {
        // First boost reputation
        pond.updateReputation(user1, Pond.Category.DeFi, 100);
        pond.updateReputation(user1, Pond.Category.Governance, 50);
        pond.updateReputation(user1, Pond.Category.Social, 25);

        // Then decay
        pond.decayReputation(user1, 30);
        
        Pond.RepScores memory scores = pond.getReputation(user1);
        require(scores.defi == 70, "DeFi score should be 70 after decay");
        require(scores.governance == 20, "Governance score should be 20 after decay");
        require(scores.social == 0, "Social score should be 0 after decay");
        emit TestEvent(true, "Decay reputation test passed");
    }

    function testBadgeSystem() public {
        // Check initial badge status
        Pond.Badge memory badges = pond.getBadges(user1);
        require(!badges.hasDefiBadge, "Should not have DeFi badge initially");
        require(!badges.hasGovernanceBadge, "Should not have Governance badge initially");
        require(!badges.hasSocialBadge, "Should not have Social badge initially");

        // Earn enough for a badge
        pond.updateReputation(user1, Pond.Category.DeFi, 100);
        require(pond.isReadyForBadge(user1, Pond.Category.DeFi), "Should be ready for DeFi badge");

        // Mint badge
        pond.mintBadge(user1, Pond.Category.DeFi);
        badges = pond.getBadges(user1);
        require(badges.hasDefiBadge, "Should have DeFi badge after minting");
        emit TestEvent(true, "Badge system test passed");
    }

    function testBadgeRevocation() public {
        // Earn and mint badge
        pond.updateReputation(user1, Pond.Category.DeFi, 100);
        pond.mintBadge(user1, Pond.Category.DeFi);

        // Decay reputation below threshold
        pond.decayReputation(user1, 50);
        
        Pond.Badge memory badges = pond.getBadges(user1);
        require(!badges.hasDefiBadge, "Should not have DeFi badge after decay");
        emit TestEvent(true, "Badge revocation test passed");
    }

    function runAllTests() public {
        testInitialReputation();
        testUpdateReputation();
        testMultiBoostReputation();
        testDecayReputation();
        testBadgeSystem();
        testBadgeRevocation();
        emit TestEvent(true, "All tests passed");
    }
} 