const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test LendLand Smart Contract', function () {

    let deployer, attacker;
    let weth, lendland, dai;

    // Addresses
    const PAIR_ADDRESS = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11" // DAI/WETH
    const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    const IMPERSONATED_ACCOUNT_ADDRESS = "0xf977814e90da44bfa03b6295a0616a897441acec" // Binance Hot Wallet

    // Amounts
    const WETH_LIQUIDITY = ethers.utils.parseEther('1000'); // 1000 ETH
    const DAI_LIQUIDITY = ethers.utils.parseEther('1500000'); // 1.5M USD

    // Attacker Added Constants 
    UNISWAPV2_ROUTER_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    AAVE_POOL_ADDRESS = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
    AAVE_AWETH_ADDRESS = '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e';
    AAVE_ADAI_ADDRESS = '0x028171bCA77440897B824Ca71D1c56caC55b68A3';

    before(async function () {
        
        [deployer, attacker] = await ethers.getSigners();

         // Attacker starts with 1 ETH
         await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0xDE0B6B3A7640000", // 1 ETH
        ]);
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.equal(ethers.utils.parseEther('1'));

        // Deploy LendLand with DAI/WETH contract
        const LendLandFactory = await ethers.getContractFactory(
            'TestLendLand',
            deployer
        );
        lendland = await LendLandFactory.deploy(PAIR_ADDRESS);

        // Load Tokens contract
        weth = await ethers.getContractAt(
            "IWETH9",
            WETH_ADDRESS
        );
        dai = await ethers.getContractAt(
            "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
            DAI_ADDRESS
        );

        // Convert ETH to WETH
        await weth.deposit({value: WETH_LIQUIDITY})
        expect(await weth.balanceOf(deployer.address)).to.equal(WETH_LIQUIDITY)

        // Deposit WETH from Deployer to LendLand
        await weth.approve(lendland.address, WETH_LIQUIDITY)
        await lendland.deposit(weth.address, WETH_LIQUIDITY)
        // WETH despoit succeded
        expect(await weth.balanceOf(lendland.address)).to.equal(WETH_LIQUIDITY)
        expect(await lendland.deposited(weth.address, deployer.address)).to.equal(WETH_LIQUIDITY)

        // Depsit DAI on LendLand (from Binance hot wallet)
        let impersonatedSigner = await ethers.getImpersonatedSigner(IMPERSONATED_ACCOUNT_ADDRESS);
        await dai.connect(impersonatedSigner).approve(lendland.address, DAI_LIQUIDITY);
        await lendland.connect(impersonatedSigner).deposit(dai.address, DAI_LIQUIDITY)
        // DAI despoit succeded
        expect(await dai.balanceOf(lendland.address)).to.equal(DAI_LIQUIDITY)
        expect(await lendland.deposited(dai.address, impersonatedSigner.address)).to.equal(DAI_LIQUIDITY)
        
        // Didn't deposit WETH so can't borrow DAI
        expect(lendland.connect(impersonatedSigner).borrow(dai.address, DAI_LIQUIDITY)).to.be.reverted;

        // WETH depositor can borrow some DAI
        await lendland.borrow(dai.address, ethers.utils.parseEther('100'))
    });

    it('Test Exploit', async function () {
        
    });

    after(async function () {

        // Protocol Liquidity
        console.log("LendLand DAI balance: ", ethers.utils.formatUnits(await dai.balanceOf(lendland.address)));
        console.log("LendLand WETH balance: ", ethers.utils.formatUnits(await weth.balanceOf(lendland.address)));
        
        console.log("Attacker DAI balance: ", ethers.utils.formatUnits(await dai.balanceOf(attacker.address)));
        console.log("Attacker WETH balance: ", ethers.utils.formatUnits(await weth.balanceOf(attacker.address)));
        
        // Pool liquidity should be at least -98%
        expect(await dai.balanceOf(lendland.address)).to.be.lessThan(DAI_LIQUIDITY.mul(2).div(100))
        expect(await weth.balanceOf(lendland.address)).to.be.lessThan(WETH_LIQUIDITY.mul(2).div(100))

        // Attacker stole the liquidity - at least +92%
        expect(await dai.balanceOf(attacker.address)).to.be.greaterThan(DAI_LIQUIDITY.mul(92).div(100))
        expect(await weth.balanceOf(attacker.address)).to.be.greaterThan(WETH_LIQUIDITY.mul(92).div(100))
    });
});