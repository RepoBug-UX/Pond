// This script is for testing in Remix Polkadot
async function testPond() {
    // Get the contract instance (already deployed in Remix Polkadot)
    const contract = await polkadot.contracts.get('Pond');
    
    // Test accounts (using the test accounts provided by Remix Polkadot)
    const [alice, bob] = await polkadot.testAccounts();
    console.log('Testing with account:', alice.address);

    // Test 1: Initial reputation
    let scores = await contract.query.getReputation(alice.address);
    console.log('Initial scores:', {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 2: Update reputation
    await contract.tx.updateReputation(alice.address, 0, 50); // 0 = DeFi
    scores = await contract.query.getReputation(alice.address);
    console.log('After DeFi boost:', {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 3: Multi-boost
    const categories = [0, 1, 2]; // DeFi, Governance, Social
    const amounts = [10, 20, 30];
    await contract.tx.multiBoostReputation(alice.address, categories, amounts);
    scores = await contract.query.getReputation(alice.address);
    console.log('After multi-boost:', {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 4: Decay
    await contract.tx.decayReputation(alice.address, 30);
    scores = await contract.query.getReputation(alice.address);
    console.log('After decay:', {
        defi: scores.defi.toString(),
        governance: scores.governance.toString(),
        social: scores.social.toString()
    });

    // Test 5: Badge system
    console.log('\nTesting badge system:');
    // Earn enough for a badge
    await contract.tx.updateReputation(alice.address, 0, 100);
    let badges = await contract.query.getBadges(alice.address);
    console.log('Before minting:', {
        hasDefiBadge: badges.hasDefiBadge,
        hasGovernanceBadge: badges.hasGovernanceBadge,
        hasSocialBadge: badges.hasSocialBadge
    });

    // Mint badge
    await contract.tx.mintBadge(alice.address, 0);
    badges = await contract.query.getBadges(alice.address);
    console.log('After minting:', {
        hasDefiBadge: badges.hasDefiBadge,
        hasGovernanceBadge: badges.hasGovernanceBadge,
        hasSocialBadge: badges.hasSocialBadge
    });
}

// Run the tests
testPond().catch(console.error); 