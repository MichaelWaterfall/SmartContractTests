const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let deployer, member1, member2, attacker;
    let token, pool, governance, treasury;

    // DAO Tokens
    const DEPLOYER_TOKENS = ethers.utils.parseEther('2500000'); // 2.5M Tokens
    const MEMBER_1_TOKENS = ethers.utils.parseEther('500000'); // 500K Tokens
    const MEMBER_2_TOKENS = ethers.utils.parseEther('1000000'); // 1M Tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther('2000000'); // 2M tokens

    // Treasury ETH
    const ETH_IN_TREASURY = ethers.utils.parseEther('1500'); // 1500 ETH
    
    before(async function () {

        [deployer, member1, member2, attacker] = await ethers.getSigners();

        this.attackerInitialETHBalance = await ethers.provider.getBalance(attacker.address);

        // Contract Factories
        const DAOTokenFactory = await ethers.getContractFactory(
            'TestDAOToken',
            deployer
        );
        const GovernanceFactory = await ethers.getContractFactory(
            'TestGovernance',
            deployer
        );
        const LendingPoolFactory = await ethers.getContractFactory(
            'TestLendingPool',
            deployer
        );
        const TreasuryFactory = await ethers.getContractFactory(
            'TestTreasury',
            deployer
        );

        // Deploy and Setup Contracts
        token = await DAOTokenFactory.deploy();
        pool = await LendingPoolFactory.deploy(token.address);
        treasury = await TreasuryFactory.deploy();
        governance = await GovernanceFactory.deploy(token.address, treasury.address);
        await treasury.setGovernance(governance.address);
        
        // Send ETH to Treasury
        await deployer.sendTransaction({
            to: treasury.address,
            value: ETH_IN_TREASURY
        });
        expect(
            await ethers.provider.getBalance(treasury.address)
        ).to.be.equal(ETH_IN_TREASURY);
        
        // Mint tokens
        await token.mint(deployer.address, DEPLOYER_TOKENS);
        await token.mint(member1.address, MEMBER_1_TOKENS);
        await token.mint(member2.address, MEMBER_2_TOKENS);
        await token.mint(pool.address, TOKENS_IN_POOL);
    });

    it('Test Exploit', async function () {
        
    });

    after(async function () {

        // No ETH left in treasury
        expect(
            await ethers.provider.getBalance(treasury.address)
        ).to.be.equal('0');

        // Attacker has taken all ETH from treasury
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(((attackerInitialETHBalance).add(ETH_IN_TREASURY)).sub(ethers.utils.parseEther('0.2')));
    });
});