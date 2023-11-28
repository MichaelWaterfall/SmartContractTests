const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {
    
    let deployer, attacker;
    let token, pool;
    const POOL_TOKENS = ethers.utils.parseEther('100000000'); // 100M tokens

    before(async function () {
        
        [deployer, attacker] = await ethers.getSigners();

        // Deploy token & pool
        const Token = await ethers.getContractFactory(
            'TestToken',
            deployer
        );
        const Pool = await ethers.getContractFactory(
            'TestPool',
            deployer
        );
        token = await Token.deploy();
        pool = await Pool.deploy(token.address);

        // Transfer tokens to pool
        await token.transfer(pool.address, POOL_TOKENS);

        // Pool should have 100M, attacker should have 0 tokens
        expect(
            await token.balanceOf(pool.address)
        ).to.equal(POOL_TOKENS);
        expect(
            await token.balanceOf(attacker.address)
        ).to.equal('0');
    });

    it('Test Exploit', async function () {

    });

    after(async function () {

        // Attacker successfully stole all tokens form the pool
        expect(
            await token.balanceOf(attacker.address)
        ).to.equal(POOL_TOKENS);
        expect(
            await token.balanceOf(pool.address)
        ).to.equal('0');
    });
});
