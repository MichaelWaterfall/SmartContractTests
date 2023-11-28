const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {
    
    let deployer, attacker;

    const ETH_IN_VAULT = ethers.utils.parseEther('1000'); // 1000 ETH

    before(async function () {
        
        [deployer, attacker] = await ethers.getSigners();

        const AdvancedVaultFactory = await ethers.getContractFactory(
            'TestAdvancedVault',
            deployer
        );
        vault = await AdvancedVaultFactory.deploy();
        
        await vault.depositETH({ value: ETH_IN_VAULT });

        attackerInitialBalance = await ethers.provider.getBalance(attacker.address);

        expect(
            await ethers.provider.getBalance(vault.address)
        ).to.equal(ETH_IN_VAULT);
    });

    it('Test Exploit', async function () {
        
    });

    after(async function () {
        
        expect(
            await ethers.provider.getBalance(vault.address)
        ).to.be.equal('0');
        
        // -0.2ETH for tx fees
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(attackerInitialBalance.add(ETH_IN_VAULT).sub(ethers.utils.parseEther('0.2')));
    });
});