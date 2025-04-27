# Pond 🌊

Pond is a modular, interoperable reputation layer for the Polkadot ecosystem. It tracks wallet-based reputation across DeFi, Governance, and Social categories, enabling apps to encourage user engagement, foster ecosystem loyalty, and reward achievements via decentralized badge minting.

## 🌟 Short Summary

Offers a cross-chain reputation layer to help users and dApps track, grow, and showcase wallet reputation across the entire Polkadot ecosystem.

## 📚 Full Description

Today, user reputation is fragmented across parachains and applications. Pond builds a unified cross-ecosystem reputation framework that aggregates user actions across DeFi, Governance, and Social categories.

- Users can grow reputation across multiple parachains naturally
- Apps can easily incorporate Pond to display user reputation or create incentives
- Badges automatically mint when users reach reputation thresholds, giving tangible, on-chain rewards
- Ecosystem Quests (future roadmap) will enable users to pursue cross-chain journeys and level up their multichain presence

Pond was built specifically for Polkadot Asset Hub, leveraging Polkadot's shared security, cross-chain messaging (XCM), and smart contract platform flexibility.

## 🔧 Technical Overview

- **Contract Language**: ink! (Rust-based smart contract framework for Substrate/Polkadot)
- **Target Network**: Polkadot Asset Hub (Testnet: Westend Asset Hub)
- **Frontend**: Basic wallet dashboard to display reputation and badges
- **Deployment**: Ink! contract compiled and deployed to Asset Hub testnet

### Key Features:
- Multi-category reputation tracking (DeFi, Governance, Social)
- Multi-boost reputation updating
- Automatic badge minting at customizable thresholds
- Reputation decay mechanic (badges can be revoked if rep falls)
- Events emitted for RepBoosted and BadgeMinted

### Why Polkadot?
- **Cross-chain design**: Only possible because Polkadot enables dApps to query activity across parachains
- **Shared Security**: Asset Hub inherits the main Relay Chain's security, making deployment simple and safe
- **Customizability**: Ink! smart contracts allow flexible, fine-tuned control over storage and logic

## 📸 Screenshots

*(Add screenshots here after the frontend is spun up!)*
- Wallet Dashboard
- Reputation Progress
- Minted Badges Gallery

## 🎥 Demo Video

*(Add Loom/Youtube video link here after recording.)*
- Explains the contract
- Walkthrough of UI
- Shows contract deployed on Westend Asset Hub

## 🛠 Smart Contract Structure

- `Pond.sol` (for Solidity remix demo)
- `pond/src/lib.rs` (official Ink! contract)

### Tracks:
- reputation mapping: Address → RepScores
- badges mapping: Address → Badge status

### Main functions:
- `update_reputation(user, category, amount)`
- `multi_boost_reputation(user, [(category, amount), ...])`
- `decay_reputation(user, amount)`
- `mint_badge(user, category)`
- `get_reputation(user)`
- `get_badges(user)`

## 🌍 Block Explorer Link

*(Add link once deployed!)*
Example: https://westend.subscan.io/account/XXXXXXXXXXXXXXXX

## 🚀 Future Roadmap

- Cross-chain interaction tracking via XCM hooks
- Full frontend dashboard ("Pond Explorer")
- Sponsor-driven Ecosystem Questlines
- NFT upgradeable badge tiers
- Integration SDK for parachains

---

Pond: Unifying Reputation Across Polkadot. 🌐
