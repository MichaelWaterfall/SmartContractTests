const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Replay Attack Exercise 2', function () {

    let deployer, user1, user2, attacker;
    let realtySale, realtyToken;

    before(async function () {

        [deployer, user1, user2, attacker] = await ethers.getSigners();

        // Attacker starts with 1 ETH in balance
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0xde0b6b3a7640000", // 1 ETH
        ]);

        // Deploy RealtySale
        const RealtySaleFactory = await ethers.getContractFactory(
            "TestRealtySale",
            deployer
        );
        realtySale = await RealtySaleFactory.deploy();

        // Attach to deployed RealtyToken
        const ShareTokenFactory = await ethers.getContractFactory(
            "TestRealtyToken"
        )
        const shareTokenAddress = await realtySale.getTokenContract()
        realtyToken = await ShareTokenFactory.attach(shareTokenAddress)

        // Buy without sending ETH reverts
        expect(realtySale.connect(user1).buy()).to.be.reverted;
        
        // Some users buy tokens (1 ETH each share)
        await realtySale.connect(user1).buy({value: ethers.utils.parseEther('1')})
        await realtySale.connect(user2).buy({value: ethers.utils.parseEther('1')})

        // 2 ETH in contract
        expect(await ethers.provider.getBalance(realtySale.address)).to.equal(
            ethers.utils.parseEther('2'))

        // Buyer got their share token
        expect(await realtyToken.balanceOf(user1.address)).to.equal(1);
        expect(await realtyToken.balanceOf(user2.address)).to.equal(1);
        
    });

    it('Test Exploit', async function () {

    });

    after(async function () {

        // Attacker bought all 98 shares
        expect(await realtyToken.balanceOf(attacker.address)).to.equal(98);

        // No more shares left :(
        let maxSupply = await realtyToken.maxSupply();
        expect(await realtyToken.lastTokenID()).to.equal(maxSupply)
    });
});