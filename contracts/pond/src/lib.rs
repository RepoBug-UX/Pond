#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod pond {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    /// Reputation categories
    #[derive(scale::Encode, scale::Decode, Debug, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[allow(clippy::cast_possible_truncation)]
    pub enum Category {
        DeFi,
        Governance,
        Social,
    }

    /// Reputation scores for each category
    #[derive(
        scale::Encode,
        scale::Decode,
        Debug,
        Default,
        Clone,
        PartialEq,
    )]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct RepScores {
        defi: u32,
        governance: u32,
        social: u32,
    }

    /// Badge status for each category
    #[derive(scale::Encode, scale::Decode, Debug, Default, Clone, PartialEq)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Badge {
        pub has_defi_badge: bool,
        pub has_governance_badge: bool,
        pub has_social_badge: bool,
    }

    #[cfg(feature = "std")]
    impl ink::storage::traits::StorageLayout for RepScores {
        fn layout(key: &ink::primitives::Key) -> ink::metadata::layout::Layout {
            let fields = vec![
                ink::metadata::layout::FieldLayout::new("defi", <u32 as ink::storage::traits::StorageLayout>::layout(key)),
                ink::metadata::layout::FieldLayout::new("governance", <u32 as ink::storage::traits::StorageLayout>::layout(key)),
                ink::metadata::layout::FieldLayout::new("social", <u32 as ink::storage::traits::StorageLayout>::layout(key)),
            ];
            ink::metadata::layout::Layout::Struct(
                ink::metadata::layout::StructLayout::new("RepScores", fields)
            )
        }
    }

    #[cfg(feature = "std")]
    impl ink::storage::traits::StorageLayout for Badge {
        fn layout(key: &ink::primitives::Key) -> ink::metadata::layout::Layout {
            let fields = vec![
                ink::metadata::layout::FieldLayout::new("has_defi_badge", <bool as ink::storage::traits::StorageLayout>::layout(key)),
                ink::metadata::layout::FieldLayout::new("has_governance_badge", <bool as ink::storage::traits::StorageLayout>::layout(key)),
                ink::metadata::layout::FieldLayout::new("has_social_badge", <bool as ink::storage::traits::StorageLayout>::layout(key)),
            ];
            ink::metadata::layout::Layout::Struct(
                ink::metadata::layout::StructLayout::new("Badge", fields)
            )
        }
    }

    impl RepScores {
        /// Creates a new RepScores instance with all scores set to 0
        pub fn new() -> Self {
            Self {
                defi: 0,
                governance: 0,
                social: 0,
            }
        }

        /// Sets the score for a specific category
        pub fn set_score(&mut self, category: Category, score: u32) {
            match category {
                Category::DeFi => self.defi = score,
                Category::Governance => self.governance = score,
                Category::Social => self.social = score,
            }
        }
    }

    #[ink(storage)]
    #[derive(Default)]
    pub struct Pond {
        /// Mapping from user accounts to their reputation scores
        reputation: Mapping<AccountId, RepScores>,
        /// Mapping from user accounts to their badges
        badges: Mapping<AccountId, Badge>,
    }

    /// Event emitted when a user's reputation is boosted
    #[ink(event)]
    pub struct RepBoosted {
        #[ink(topic)]
        account: AccountId,
        category: Category,
        new_score: u32,
    }

    /// Event emitted when a badge is minted
    #[ink(event)]
    pub struct BadgeMinted {
        #[ink(topic)]
        account: AccountId,
        category: Category,
    }

    impl Pond {
        /// Creates a new Pond contract
        #[ink(constructor)]
        pub fn new() -> Self {
            Self::default()
        }

        /// Gets the reputation scores for a user
        #[ink(message)]
        pub fn get_reputation(&self, user: AccountId) -> RepScores {
            self.reputation.get(user).unwrap_or_default()  // Ensures default score (0)
        }

        /// Gets the reputation score for a user in a specific category
        #[ink(message)]
        pub fn get_rep_in_category(&self, user: AccountId, category: Category) -> u32 {
            let scores = self.get_reputation(user);
            match category {
                Category::DeFi => scores.defi,
                Category::Governance => scores.governance,
                Category::Social => scores.social,
            }
        }

        /// Updates the reputation score for a user in a specific category
        #[ink(message)]
        pub fn update_reputation(&mut self, user: AccountId, category: Category, score: u32) {
            let mut scores = self.reputation.get(user).unwrap_or_default();
            let current_score = match category {
                Category::DeFi => scores.defi,
                Category::Governance => scores.governance,
                Category::Social => scores.social,
            };
            let new_score = current_score.saturating_add(score);
            scores.set_score(category.clone(), new_score);
            self.reputation.insert(user, &scores);
            
            // Emit event when reputation is boosted
            self.env().emit_event(RepBoosted {
                account: user,
                category: category.clone(),
                new_score,
            });

            // Update badge status
            self.update_badge_status(user, category, new_score);
        }

        /// Updates badge status based on reputation score
        fn update_badge_status(&mut self, user: AccountId, category: Category, score: u32) {
            let mut badge = self.badges.get(user).unwrap_or_default();
            match category {
                Category::DeFi if score < 100 => badge.has_defi_badge = false,
                Category::Governance if score < 100 => badge.has_governance_badge = false,
                Category::Social if score < 100 => badge.has_social_badge = false,
                _ => (), // No change
            }
            self.badges.insert(user, &badge);
        }

        /// Boosts reputation across multiple categories at once
        #[ink(message)]
        pub fn multi_boost_reputation(&mut self, user: AccountId, boosts: Vec<(Category, u32)>) {
            let mut scores = self.reputation.get(user).unwrap_or_default();
            for (category, amount) in boosts {
                let current = match category {
                    Category::DeFi => scores.defi,
                    Category::Governance => scores.governance,
                    Category::Social => scores.social,
                };
                let new_score = current.saturating_add(amount);
                scores.set_score(category.clone(), new_score);
                self.env().emit_event(RepBoosted {
                    account: user,
                    category: category.clone(),
                    new_score,
                });

                // Update badge status
                self.update_badge_status(user, category, new_score);
            }
            self.reputation.insert(user, &scores);
        }

        /// Decays reputation in all categories
        #[ink(message)]
        pub fn decay_reputation(&mut self, user: AccountId, amount: u32) {
            let mut scores = self.reputation.get(user).unwrap_or_default();
            
            // Decay each category, ensuring it doesn't go below 0
            scores.defi = scores.defi.saturating_sub(amount);
            scores.governance = scores.governance.saturating_sub(amount);
            scores.social = scores.social.saturating_sub(amount);
            
            self.reputation.insert(user, &scores);

            // Update badge status for all categories
            self.update_badge_status(user, Category::DeFi, scores.defi);
            self.update_badge_status(user, Category::Governance, scores.governance);
            self.update_badge_status(user, Category::Social, scores.social);
        }

        /// Checks if a user is ready for a badge in a specific category
        #[ink(message)]
        pub fn is_ready_for_badge(&self, user: AccountId, category: Category) -> bool {
            let scores = self.get_reputation(user);
            match category {
                Category::DeFi => scores.defi >= 100,
                Category::Governance => scores.governance >= 100,
                Category::Social => scores.social >= 100,
            }
        }

        /// Mints a badge for a user in a specific category if they qualify
        #[ink(message)]
        pub fn mint_badge(&mut self, user: AccountId, category: Category) {
            let scores = self.get_reputation(user);
            let mut badge = self.badges.get(user).unwrap_or_default();

            match category {
                Category::DeFi if scores.defi >= 100 => {
                    badge.has_defi_badge = true;
                    self.env().emit_event(BadgeMinted {
                        account: user,
                        category: Category::DeFi,
                    });
                },
                Category::Governance if scores.governance >= 100 => {
                    badge.has_governance_badge = true;
                    self.env().emit_event(BadgeMinted {
                        account: user,
                        category: Category::Governance,
                    });
                },
                Category::Social if scores.social >= 100 => {
                    badge.has_social_badge = true;
                    self.env().emit_event(BadgeMinted {
                        account: user,
                        category: Category::Social,
                    });
                },
                _ => (), // Not enough score, do nothing
            }

            self.badges.insert(user, &badge);
        }

        /// Gets the badges for a user
        #[ink(message)]
        pub fn get_badges(&self, user: AccountId) -> Badge {
            self.badges.get(user).unwrap_or_default()
        }
    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn test_get_reputation() {
            let mut pond = Pond::new();
            let user = AccountId::from([0x1; 32]);
            
            // Initially no reputation
            let initial_scores = pond.get_reputation(user);
            assert_eq!(initial_scores.defi, 0);
            assert_eq!(initial_scores.governance, 0);
            assert_eq!(initial_scores.social, 0);
            
            // Set and get reputation
            pond.update_reputation(user, Category::DeFi, 100);
            let scores = pond.get_reputation(user);
            assert_eq!(scores.defi, 100);

            // Increment reputation
            pond.update_reputation(user, Category::DeFi, 50);
            let scores = pond.get_reputation(user);
            assert_eq!(scores.defi, 150);
        }

        /// We test a full use case of our contract.
        #[ink::test]
        fn test_update_reputation() {
            let mut pond = Pond::new();
            let user = AccountId::from([0x1; 32]);
            
            // Update multiple categories
            pond.update_reputation(user, Category::DeFi, 100);
            pond.update_reputation(user, Category::Governance, 200);
            pond.update_reputation(user, Category::Social, 300);
            
            let scores = pond.get_reputation(user);
            assert_eq!(scores.defi, 100);
            assert_eq!(scores.governance, 200);
            assert_eq!(scores.social, 300);

            // Increment all categories
            pond.update_reputation(user, Category::DeFi, 50);
            pond.update_reputation(user, Category::Governance, 100);
            pond.update_reputation(user, Category::Social, 150);
            
            let scores = pond.get_reputation(user);
            assert_eq!(scores.defi, 150);
            assert_eq!(scores.governance, 300);
            assert_eq!(scores.social, 450);
        }

        /// We test the emission of RepBoosted event.
        #[ink::test]
        fn test_multiple_categories() {
            let mut pond = Pond::new();
            let account = AccountId::from([0x1; 32]);

            // Update all categories
            pond.update_reputation(account, Category::DeFi, 10);
            pond.update_reputation(account, Category::Governance, 5);
            pond.update_reputation(account, Category::Social, 7);

            // Check full rep
            let rep = pond.get_reputation(account);
            assert_eq!(rep.defi, 10);
            assert_eq!(rep.governance, 5);
            assert_eq!(rep.social, 7);

            // Increment and check again
            pond.update_reputation(account, Category::DeFi, 5);
            pond.update_reputation(account, Category::Governance, 3);
            pond.update_reputation(account, Category::Social, 2);

            // Test get_rep_in_category
            assert_eq!(pond.get_rep_in_category(account, Category::DeFi), 15);
            assert_eq!(pond.get_rep_in_category(account, Category::Governance), 8);
            assert_eq!(pond.get_rep_in_category(account, Category::Social), 9);
        }

        /// We test the badge system
        #[ink::test]
        fn test_badge_system() {
            let mut pond = Pond::new();
            let user = AccountId::from([0x1; 32]);

            // Initially no badges
            let initial_badges = pond.get_badges(user);
            assert!(!initial_badges.has_defi_badge);
            assert!(!initial_badges.has_governance_badge);
            assert!(!initial_badges.has_social_badge);

            // Not ready for badges yet
            assert!(!pond.is_ready_for_badge(user, Category::DeFi));
            assert!(!pond.is_ready_for_badge(user, Category::Governance));
            assert!(!pond.is_ready_for_badge(user, Category::Social));

            // Earn enough reputation for DeFi badge
            pond.update_reputation(user, Category::DeFi, 100);
            assert!(pond.is_ready_for_badge(user, Category::DeFi));
            pond.mint_badge(user, Category::DeFi);
            let badges = pond.get_badges(user);
            assert!(badges.has_defi_badge);
            assert!(!badges.has_governance_badge);
            assert!(!badges.has_social_badge);

            // Earn enough reputation for Governance badge
            pond.update_reputation(user, Category::Governance, 100);
            assert!(pond.is_ready_for_badge(user, Category::Governance));
            pond.mint_badge(user, Category::Governance);
            let badges = pond.get_badges(user);
            assert!(badges.has_defi_badge);
            assert!(badges.has_governance_badge);
            assert!(!badges.has_social_badge);

            // Try to mint badge without enough reputation
            pond.update_reputation(user, Category::Social, 50);
            assert!(!pond.is_ready_for_badge(user, Category::Social));
            pond.mint_badge(user, Category::Social);
            let badges = pond.get_badges(user);
            assert!(!badges.has_social_badge);
        }

        /// We test multi-boost and decay functionality
        #[ink::test]
        fn test_multi_boost_and_decay() {
            let mut pond = Pond::new();
            let user = AccountId::from([0x1; 32]);

            // Test multi-boost
            let boosts = vec![
                (Category::DeFi, 50),
                (Category::Governance, 30),
                (Category::Social, 20),
            ];
            pond.multi_boost_reputation(user, boosts);

            let scores = pond.get_reputation(user);
            assert_eq!(scores.defi, 50);
            assert_eq!(scores.governance, 30);
            assert_eq!(scores.social, 20);

            // Test decay
            pond.decay_reputation(user, 20);
            let scores = pond.get_reputation(user);
            assert_eq!(scores.defi, 30);
            assert_eq!(scores.governance, 10);
            assert_eq!(scores.social, 0);

            // Test badge revocation through decay
            // First earn a badge
            pond.update_reputation(user, Category::DeFi, 100);
            pond.mint_badge(user, Category::DeFi);
            assert!(pond.get_badges(user).has_defi_badge);

            // Then decay below threshold
            pond.decay_reputation(user, 50);
            assert!(!pond.get_badges(user).has_defi_badge);

            // Test multi-boost with badge qualification
            let boosts = vec![
                (Category::DeFi, 100),
                (Category::Governance, 100),
                (Category::Social, 100),
            ];
            pond.multi_boost_reputation(user, boosts);

            // Mint badges and verify
            pond.mint_badge(user, Category::DeFi);
            pond.mint_badge(user, Category::Governance);
            pond.mint_badge(user, Category::Social);

            let badges = pond.get_badges(user);
            assert!(badges.has_defi_badge);
            assert!(badges.has_governance_badge);
            assert!(badges.has_social_badge);
        }
    }
}
