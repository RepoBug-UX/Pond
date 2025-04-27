const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Pond Contract", function () {
    let pond;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        
        const Pond = await ethers.getContractFactory("Pond");
        pond = await Pond.deploy();
        await pond.deployed();
    });

    describe("Reputation Management", function () {
        it("Should initialize with zero reputation", async function () {
            const scores = await pond.getReputation(user1.address);
            expect(scores.defi).to.equal(0);
            expect(scores.governance).to.equal(0);
            expect(scores.social).to.equal(0);
        });

        it("Should update reputation in a specific category", async function () {
            await pond.updateReputation(user1.address, 0, 50); // 0 = DeFi
            const scores = await pond.getReputation(user1.address);
            expect(scores.defi).to.equal(50);
        });

        it("Should get reputation in a specific category", async function () {
            await pond.updateReputation(user1.address, 1, 75); // 1 = Governance
            const score = await pond.getRepInCategory(user1.address, 1);
            expect(score).to.equal(75);
        });

        it("Should boost multiple categories at once", async function () {
            const categories = [0, 1, 2]; // DeFi, Governance, Social
            const amounts = [10, 20, 30];
            
            await pond.multiBoostReputation(user1.address, categories, amounts);
            const scores = await pond.getReputation(user1.address);
            
            expect(scores.defi).to.equal(10);
            expect(scores.governance).to.equal(20);
            expect(scores.social).to.equal(30);
        });

        it("Should decay reputation in all categories", async function () {
            // First boost reputation
            await pond.updateReputation(user1.address, 0, 100);
            await pond.updateReputation(user1.address, 1, 50);
            await pond.updateReputation(user1.address, 2, 25);

            // Then decay
            await pond.decayReputation(user1.address, 30);
            
            const scores = await pond.getReputation(user1.address);
            expect(scores.defi).to.equal(70);
            expect(scores.governance).to.equal(20);
            expect(scores.social).to.equal(0); // Should not go below 0
        });
    });

    describe("Badge System", function () {
        it("Should not have badges initially", async function () {
            const badges = await pond.getBadges(user1.address);
            expect(badges.hasDefiBadge).to.be.false;
            expect(badges.hasGovernanceBadge).to.be.false;
            expect(badges.hasSocialBadge).to.be.false;
        });

        it("Should check badge eligibility correctly", async function () {
            await pond.updateReputation(user1.address, 0, 99);
            expect(await pond.isReadyForBadge(user1.address, 0)).to.be.false;
            
            await pond.updateReputation(user1.address, 0, 1);
            expect(await pond.isReadyForBadge(user1.address, 0)).to.be.true;
        });

        it("Should mint badge when eligible", async function () {
            await pond.updateReputation(user1.address, 0, 100);
            await pond.mintBadge(user1.address, 0);
            
            const badges = await pond.getBadges(user1.address);
            expect(badges.hasDefiBadge).to.be.true;
        });

        it("Should not mint badge when not eligible", async function () {
            await pond.updateReputation(user1.address, 0, 99);
            await expect(pond.mintBadge(user1.address, 0))
                .to.be.revertedWith("Not enough reputation for badge");
        });

        it("Should revoke badge when reputation drops", async function () {
            // Earn badge
            await pond.updateReputation(user1.address, 0, 100);
            await pond.mintBadge(user1.address, 0);
            
            // Decay reputation
            await pond.decayReputation(user1.address, 50);
            
            const badges = await pond.getBadges(user1.address);
            expect(badges.hasDefiBadge).to.be.false;
        });
    });

    describe("Events", function () {
        it("Should emit RepBoosted event", async function () {
            await expect(pond.updateReputation(user1.address, 0, 50))
                .to.emit(pond, "RepBoosted")
                .withArgs(user1.address, 0, 50);
        });

        it("Should emit BadgeMinted event", async function () {
            await pond.updateReputation(user1.address, 0, 100);
            await expect(pond.mintBadge(user1.address, 0))
                .to.emit(pond, "BadgeMinted")
                .withArgs(user1.address, 0);
        });
    });
}); 