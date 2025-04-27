// This script is for testing in Remix Polkadot with Polkavm
async function testPond() {
    // Deploy the contract
    const Pond = await ethers.getContractFactory("Pond");
    const pond = await Pond.deploy();
    await pond.deployed();
    console.log("Contract deployed at:", pond.address);

    // Get test accounts (Polkavm uses the same account system as Ethereum)
    const [owner, user1] = await ethers.getSigners();
    console.log("Testing with user:", user1.address);

    // Test 1: Initial reputation
    let scores = await pond.getReputation(user1.address);
    console.log("Initial scores:", {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 2: Update reputation
    await pond.updateReputation(user1.address, 0, 50); // 0 = DeFi
    scores = await pond.getReputation(user1.address);
    console.log("After DeFi boost:", {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 3: Multi-boost
    const categories = [0, 1, 2]; // DeFi, Governance, Social
    const amounts = [10, 20, 30];
    await pond.multiBoostReputation(user1.address, categories, amounts);
    scores = await pond.getReputation(user1.address);
    console.log("After multi-boost:", {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 4: Decay
    await pond.decayReputation(user1.address, 30);
    scores = await pond.getReputation(user1.address);
    console.log("After decay:", {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 5: Badge system
    console.log("\nTesting badge system:");
    // Earn enough for a badge
    await pond.updateReputation(user1.address, 0, 100);
    let badges = await pond.getBadges(user1.address);
    console.log("Before minting:", {
        hasDefiBadge: badges.hasDefiBadge,
        hasGovernanceBadge: badges.hasGovernanceBadge,
        hasSocialBadge: badges.hasSocialBadge
    });

    // Mint badge
    await pond.mintBadge(user1.address, 0);
    badges = await pond.getBadges(user1.address);
    console.log("After minting:", {
        hasDefiBadge: badges.hasDefiBadge,
        hasGovernanceBadge: badges.hasGovernanceBadge,
        hasSocialBadge: badges.hasSocialBadge
    });
}

// Run the tests
testPond().catch(console.error); 