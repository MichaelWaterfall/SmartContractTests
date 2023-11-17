const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Auction', function () {

    let deployer, user1, user2, attacker;
    let auction;

    const USER1_FIRST_BID = ethers.utils.parseEther('5'); 
    const USER2_FIRST_BID = ethers.utils.parseEther('6.5');
    
    before(async function () {

        [deployer, user1, user2, attacker] = await ethers.getSigners();

        const AuctionFactory = await ethers.getContractFactory(
            'TestAuction',
            deployer
        );
        auction = await AuctionFactory.deploy();

        await auction.connect(user1).bid({value: USER1_FIRST_BID});
        awaitauction.connect(user2).bid({value: USER2_FIRST_BID});

        expect(await auction.highestBid()).to.be.equal(USER2_FIRST_BID);
        expect(await auction.currentLeader()).to.be.equal(user2.address);
    });

    it('Exploit', async function () {
             
    });

    after(async function () {
        
        let highestBid = await auction.highestBid();
        
        await expect(auction.connect(user1).bid({value: highestBid.mul(3)})).to.be.reverted;

        expect(await auction.currentLeader()).to.not.be.equal(user1.address);
        expect(await auction.currentLeader()).to.not.be.equal(user2.address);
    });
});