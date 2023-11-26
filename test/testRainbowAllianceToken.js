const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let deployer, user1, user2, user3;
    let rainbowAlliance;

    const DEPLOYER_MINT = ethers.utils.parseEther('1000');
    const USERS_MINT = ethers.utils.parseEther('100');
    const USER2_BURN = ethers.utils.parseEther('30');
    
    before(async function () {

        [deployer, user1, user2, user3] = await ethers.getSigners();

        // Deploy contract
        const RainbowAllianceTokenFactory = await ethers.getContractFactory(
            'TestRainbowAllianceToken',
            deployer
        );
        rainbowAlliance = await RainbowAllianceTokenFactory.deploy();

        // Mint for deployer tokens
        await rainbowAlliance.mint(deployer.address, DEPLOYER_MINT)
        
        // Mint tokens to user1 and user2
        await rainbowAlliance.mint(user1.address, USERS_MINT)
        await rainbowAlliance.mint(user2.address, USERS_MINT)

        // Burn tokens from user2
        await rainbowAlliance.burn(user2.address, USER2_BURN)        
    });

    it('Test governance', async function () {
        
        // Can't create proposals, if there is no voting power
        await expect(rainbowAlliance.connect(user3).createProposal("Donate 1000$ to charities")).
        to.be.revertedWith("no voting rights");

        // Should be able to create proposals if you have voting power
        await expect(await rainbowAlliance.createProposal("Pay 100$ to george for a new Logo")).
        to.not.be.reverted;

        // Can't vote twice
        await expect(rainbowAlliance.vote(1, true)).to.be.revertedWith("already voted");
        
        // Shouldn't be able to vote without voting rights
        await expect(rainbowAlliance.connect(user3).vote(1, true)).to.be.revertedWith("no voting rights");

        // Non existing proposal, reverts
        await expect(rainbowAlliance.vote(123, false)).to.be.revertedWith("proposal doesn't exist");

        // Users votes
        await rainbowAlliance.connect(user1).vote(1, true)
        await rainbowAlliance.connect(user2).vote(1, false)

        // Check accounting is correct
        let proposal = await rainbowAlliance.getProposal(1);
        console.log(proposal);
        // Supposed to be 1,100 (User1 - 100, deployer - 1,000)
        expect(proposal.yes).to.equal(DEPLOYER_MINT.add(USERS_MINT));
        // Supposed to be 70 (100 - 30, becuase we burned 30 tokens of user2)
        expect(proposal.no).to.equal(USERS_MINT.sub(USER2_BURN));
    });
    
    it('Test Exploit', async function () {

    });
});