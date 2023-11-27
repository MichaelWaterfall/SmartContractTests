const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {
    
    let deployer, attacker;
    let ust, dai, usdc;
    const TOKENS_INITIAL_SUPPLY = ethers.utils.parseEther('100000000', 6); // $100M
    const TOKENS_IN_STABLESWAP = ethers.utils.parseEther('1000000', 6); // $1M
    const CHAIN_ID = 31337;

    before(async function () {

        [deployer, attacker] = await ethers.getSigners();

        // Deploy Tokens
        // Deploy UST
        const USTFactory = await ethers.getContractFactory(
            'TestUST',
            deployer
        );
        ust = await USTFactory.deploy(TOKENS_INITIAL_SUPPLY, "Terra USD", "UST", 6);
        // Deploy DAI
        const DAIFactory = await ethers.getContractFactory(
            'TestDAI',
            deployer
        );
        dai = await DAIFactory.deploy(CHAIN_ID);
        // Deploy USDC
        const USDCFactory = await ethers.getContractFactory(
            'TestUSDC',
            deployer
        );
        usdc = await USDCFactory.deploy();
        await usdc.initialize(
            "Center Coin", "USDC", "USDC", 6, deployer.address,
            deployer.address, deployer.address, deployer.address
        );

        // Mint Tokens to Deployer
        await this.dai.mint(deployer.address, TOKENS_INITIAL_SUPPLY);
        await this.usdc.configureMinter(deployer.address, TOKENS_INITIAL_SUPPLY);
        await this.usdc.mint(deployer.address, TOKENS_INITIAL_SUPPLY);

        // Deploy StableSwap
        const StableSwapFactory = await ethers.getContractFactory(
            'TestStableSwap',
            deployer
        );
        stableSwap = await StableSwapFactory.deploy([
            ust.address, usdc.address, dai.address
        ]);

        // Check allowed tokens
        expect(await stableSwap.isSupported(usdc.address, dai.address)).to.equal(true);
        expect(await stableSwap.isSupported(usdc.address, ust.address)).to.equal(true);
        
        // Send tokens to StableSwap
        await ust.transfer(stableSwap.address, TOKENS_IN_STABLESWAP);
        await dai.transfer(stableSwap.address, TOKENS_IN_STABLESWAP);
        await usdc.transfer(stableSwap.address, TOKENS_IN_STABLESWAP);

        // Check StableSwap Balance
        expect(await ust.balanceOf(stableSwap.address)).to.equal(TOKENS_IN_STABLESWAP)
        expect(await dai.balanceOf(stableSwap.address)).to.equal(TOKENS_IN_STABLESWAP)
        expect(await usdc.balanceOf(stableSwap.address)).to.equal(TOKENS_IN_STABLESWAP)

        // Swap works, balances are ok
        let amount = ethers.utils.parseEther('100', 6);
        await usdc.approve(stableSwap.address, amount)
        await expect(stableSwap.swap(usdc.address, dai.address, amount)).to.not.be.reverted;
        expect(await usdc.balanceOf(stableSwap.address)).to.equal(TOKENS_IN_STABLESWAP.add(amount));
        expect(await dai.balanceOf(stableSwap.address)).to.equal(TOKENS_IN_STABLESWAP.sub(amount));

        // Swap fails without allowance
        await expect(stableSwap.swap(usdc.address, dai.address, amount)).to.be.reverted;

        stableSwapDAIBalance = await dai.balanceOf(stableSwap.address);
        stableSwapUSDCBalance = await usdc.balanceOf(stableSwap.address);
        stableSwapUSTBalance = await ust.balanceOf(stableSwap.address);
    });


    it('Test Exploit', async function () {
        
    });

    
    after(async function () {

        // Attacker was able to drain the entire protocol balance!
        expect(await usdc.balanceOf(stableSwap.address)).to.equal(0);
        expect(await dai.balanceOf(stableSwap.address)).to.equal(0);
        expect(await ust.balanceOf(stableSwap.address)).to.equal(0);

        expect(await usdc.balanceOf(attacker.address)).to.equal(stableSwapUSDCBalance);
        expect(await dai.balanceOf(attacker.address)).to.equal(stableSwapDAIBalance);
        expect(await ust.balanceOf(attacker.address)).to.equal(stableSwapUSTBalance);
    });

});