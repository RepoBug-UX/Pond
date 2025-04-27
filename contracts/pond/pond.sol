// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Pond {
    // Reputation categories
    enum Category { DeFi, Governance, Social }

    // Reputation scores for each category
    struct RepScores {
        uint256 defi;
        uint256 governance;
        uint256 social;
    }

    // Badge status for each category
    struct Badge {
        bool hasDefiBadge;
        bool hasGovernanceBadge;
        bool hasSocialBadge;
    }

    // Events
    event RepBoosted(address indexed account, Category category, uint256 newScore);
    event BadgeMinted(address indexed account, Category category);

    // Mappings
    mapping(address => RepScores) public reputation;
    mapping(address => Badge) public badges;

    // Constructor
    constructor() {}

    // Get reputation scores for a user
    function getReputation(address user) public view returns (RepScores memory) {
        return reputation[user];
    }

    // Get reputation score for a specific category
    function getRepInCategory(address user, Category category) public view returns (uint256) {
        if (category == Category.DeFi) return reputation[user].defi;
        if (category == Category.Governance) return reputation[user].governance;
        return reputation[user].social;
    }

    // Update reputation score for a specific category
    function updateReputation(address user, Category category, uint256 score) public {
        RepScores storage scores = reputation[user];
        
        if (category == Category.DeFi) {
            scores.defi += score;
            emit RepBoosted(user, category, scores.defi);
        } else if (category == Category.Governance) {
            scores.governance += score;
            emit RepBoosted(user, category, scores.governance);
        } else {
            scores.social += score;
            emit RepBoosted(user, category, scores.social);
        }

        updateBadgeStatus(user, category);
    }

    // Update badge status based on reputation score
    function updateBadgeStatus(address user, Category category) private {
        Badge storage badge = badges[user];
        uint256 score = getRepInCategory(user, category);

        if (category == Category.DeFi) {
            badge.hasDefiBadge = score >= 100;
        } else if (category == Category.Governance) {
            badge.hasGovernanceBadge = score >= 100;
        } else {
            badge.hasSocialBadge = score >= 100;
        }
    }

    // Boost reputation across multiple categories
    function multiBoostReputation(address user, Category[] memory categories, uint256[] memory amounts) public {
        require(categories.length == amounts.length, "Arrays must have same length");
        
        for (uint256 i = 0; i < categories.length; i++) {
            updateReputation(user, categories[i], amounts[i]);
        }
    }

    // Decay reputation in all categories
    function decayReputation(address user, uint256 amount) public {
        RepScores storage scores = reputation[user];
        
        // Ensure scores don't go below 0
        if (scores.defi > amount) {
            scores.defi -= amount;
        } else {
            scores.defi = 0;
        }
        
        if (scores.governance > amount) {
            scores.governance -= amount;
        } else {
            scores.governance = 0;
        }
        
        if (scores.social > amount) {
            scores.social -= amount;
        } else {
            scores.social = 0;
        }

        // Update badge status for all categories
        updateBadgeStatus(user, Category.DeFi);
        updateBadgeStatus(user, Category.Governance);
        updateBadgeStatus(user, Category.Social);
    }

    // Check if a user is ready for a badge in a specific category
    function isReadyForBadge(address user, Category category) public view returns (bool) {
        return getRepInCategory(user, category) >= 100;
    }

    // Mint a badge for a user in a specific category
    function mintBadge(address user, Category category) public {
        require(isReadyForBadge(user, category), "Not enough reputation for badge");
        
        Badge storage badge = badges[user];
        
        if (category == Category.DeFi) {
            badge.hasDefiBadge = true;
        } else if (category == Category.Governance) {
            badge.hasGovernanceBadge = true;
        } else {
            badge.hasSocialBadge = true;
        }
        
        emit BadgeMinted(user, category);
    }

    // Get badges for a user
    function getBadges(address user) public view returns (Badge memory) {
        return badges[user];
    }
} 