const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Smart Contract", () => {

    let owner, bob, alice;
    let usdc, vault, strategy, yieldContract;

    const BOB_USDC_BALANCE = ethers.utils.parseUnits("100000", 6); // Bob has 100,000 USDC
    const ALICE_USDC_BALANCE = ethers.utils.parseUnits("200000", 6); // Alice has 200,000 USDC

    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WHALE = "0xf977814e90da44bfa03b6295a0616a897441acec";

    before(async () => {

        [owner, alice, bob] = await ethers.getSigners();

        // Load tokens
        this.usdc = await hre.ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            USDC,
            owner
        );

        // Whale impersonation
        const whaleSigner = await ethers.getImpersonatedSigner(WHALE);

        // Set bob, alice & whale balance to 2 ETH
        await ethers.provider.send("hardhat_setBalance", [
            bob.address,
            "0x1BC16D674EC80000", // 2 ETH (ETH -> WEI -> Hexdecimal)
        ]);
        await ethers.provider.send("hardhat_setBalance", [
            alice.address,
            "0x1BC16D674EC80000", // 2 ETH (ETH -> WEI -> Hexdecimal)
        ]);
        await ethers.provider.send("hardhat_setBalance", [
            whaleSigner.address,
            "0x1BC16D674EC80000", // 2 ETH (ETH -> WEI -> Hexdecimal)
        ]);

        // Transfer USDC to bob & alice
        await usdc.connect(whaleSigner).transfer(alice.address, ALICE_USDC_BALANCE);
        await usdc.connect(whaleSigner).transfer(bob.address, BOB_USDC_BALANCE);

        // Deploy the vault system
        const YieldContractFactory = await ethers.getContractFactory(
            "TestYieldContract",
            owner
        );
        const StrategyFactory = await ethers.getContractFactory(
            "TestOptimizerStrategy",
            owner
        );
        const VaultFactory = await ethers.getContractFactory(
            "TestOptimizerVault",
            owner
        );

        yieldContract = await YieldContractFactory.deploy(USDC);
        strategy = await StrategyFactory.deploy(yieldContract.address);
        vault = await VaultFactory.deploy(strategy.address, "VAULT", "VLT");

        // Assign the vault to the strategy
        await strategy.setVault(vault.address);

        // Approve the vault for the bob & alice
        await usdc.connect(alice).approve(vault.address, ALICE_USDC_BALANCE);
        await usdc.connect(bob).approve(vault.address, BOB_USDC_BALANCE);

        // Alice & Bob deposit their USDC into the vault
        await vault.connect(bob).deposit(BOB_USDC_BALANCE);
        await vault.connect(alice).deposit(ALICE_USDC_BALANCE);
    });

    it("Test Exploit", async () => {
        
    });

    after(async () => {

        const ruggedAmount = BOB_USDC_BALANCE.add(ALICE_USDC_BALANCE);
        const withdrawalFees = ruggedAmount.mul(10).div(1000);

        // The strategy is now empty except for withdrawal fees
        expect(await strategy.balanceOf()).to.eq(withdrawalFees);

        // The owner now holds the rugged USDC minus withdrawalFees
        expect(await usdc.balanceOf(owner.address)).to.eq(ruggedAmount.sub(withdrawalFees));
    });
});