const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let deployer, user1, user2, attacker;
    let ChocolateFactory, chocolate, weth;

    const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"

    const INITIAL_MINT = ethers.utils.parseEther('1000000'); 
    const INITIAL_LIQUIDITY = ethers.utils.parseEther('100000'); 
    const ETH_IN_LIQUIDITY = ethers.utils.parseEther('100');
    const USER1_SWAP = ethers.utils.parseEther('120');
    const USER2_SWAP = ethers.utils.parseEther('100');
    
    before(async function () {

        [deployer, user1, user2, attacker] = await ethers.getSigners()
        let signers = [deployer, user1, user2, attacker]

        // Everyone starts with 300 ETH
        for(let i = 0; i < signers.length; i++) {
            await ethers.provider.send("hardhat_setBalance", [
                signers[i].address,
                "0x1043561A8829300000", // 300 ETH
            ]);
        }

        attackerInitialETHBalance = await ethers.provider.getBalance(attacker.address);
        
        weth = await ethers.getContractAt(
            "IWETH9",
            WETH_ADDRESS
        );
    });

    it('Deployment', async function () {

        ChocolateFactory = await ethers.getContractFactory(
            'TestChocolate',
            deployer
        );
        chocolate = await ChocolateFactory.deploy(INITIAL_MINT);

        let pairAddress = await chocolate.uniswapV2Pair();
        pair = await ethers.getContractAt(
            "IUniswapV2Pair",
            pairAddress
        );
    });

    it('Deployer adds liquidity', async function () {
        await chocolate.approve(chocolate.address, INITIAL_LIQUIDITY);
        await chocolate.addChocolateLiquidity(INITIAL_LIQUIDITY, {value: ETH_IN_LIQUIDITY});
    });

    it('User swap', async function () {
        
        // User1 swaps 120 ETH to Chocolate
        await chocolate.connect(user1).swapChocolates(
            weth.address, USER1_SWAP,
            {value: USER1_SWAP, gasPrice: 0x4133810a0}
        );

        // User2 swaps 100 ETH to Chocolate
        await chocolate.connect(user2).swapChocolates(
            weth.address, USER2_SWAP,
            {value: USER2_SWAP, gasPrice: 0x4133110a0}
        );

    });
    
    it('Did someone ask for noise?', async function () {
        for (let i = 0; i < 10; i++) {
            await deployer.sendTransaction({
                to: ethers.Wallet.createRandom().address,
                value: ethers.utils.parseEther('0.01'),
            });
        }
    });
    
    it('Test Exploit', async function () {

    });

    after(async function () {

        // Mine all the transactions
        await ethers.provider.send('evm_mine', []);

        // Attacker suppose to make more than 110 ETH in profit!
        attackerETHBalance = await ethers.provider.getBalance(attacker.address)
        console.log("attackerETHBalance after: ", attackerETHBalance)
        expect(attackerETHBalance).to.be.greaterThan(
            attackerInitialETHBalance.add(ethers.utils.parseEther('200'))
        )
        
    });
});