const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('TokenSale Contract Test', function () {

    let tokenSale;
    let deployer, user1, user2, user3, attacker;

    const USER1_INVESTMENT = ethers.utils.parseEther('5'); 
    const USER2_INVESTMENT = ethers.utils.parseEther('15');
    const USER3_INVESTMENT = ethers.utils.parseEther('23');
    
    before(async function () {

        [deployer, user1, user2, user3, attacker] = await ethers.getSigners();

        const tokenSaleFactory = await ethers.getContractFactory(
            'TokenSale',
            deployer
        );
        tokenSale = await tokenSaleFactory.deploy();

        // Invest
        await tokenSale.connect(user1).invest({value: USER1_INVESTMENT});
        await tokenSale.connect(user2).invest({value: USER2_INVESTMENT});
        await tokenSale.connect(user3).invest({value: USER3_INVESTMENT});

        expect(await tokenSale.claimable(user1.address, 0)).to.be.equal(USER1_INVESTMENT.mul(5));
        expect(await tokenSale.claimable(user2.address, 0)).to.be.equal(USER2_INVESTMENT.mul(5));
        expect(await tokenSale.claimable(user3.address, 0)).to.be.equal(USER3_INVESTMENT.mul(5));
    });

    it('Exploit', async function () {
           
    }).timeout(100000000);

    after(async function () {
        await expect(tokenSale.distributeTokens()).to.be.reverted;
    });
});