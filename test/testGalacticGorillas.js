const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Galactic Gorillas', function () {

    let deployer, user, attacker;
    let nft;

    const MINT_PRICE = ethers.utils.parseEther('1'); // 1 ETH
    
    before(async function () {

        [deployer, user, attacker] = await ethers.getSigners();

        // Attacker balance is 2.5 ETH
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x22B1C8C1227A0000", // 2.5 ETH (ETH -> WEI -> Hexdecimal)
        ]);
    
        // Deploy contracts
        const GalacticGorillasFactory = await ethers.getContractFactory(
            'contracts/dos-4/GalacticGorillas.sol:GalacticGorillas',
            deployer
        );
        nft = await GalacticGorillasFactory.deploy();
    });

    it('Success minting tests', async function () {
        let deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);
        await nft.connect(user).mint(2, {value: MINT_PRICE.mul(2)});
        expect(await nft.balanceOf(user.address)).to.be.equal(2)
        expect(await nft.ownerOf(1)).to.be.equal(user.address)
        expect(await nft.ownerOf(2)).to.be.equal(user.address)
        let deployerBalanceAfter = await ethers.provider.getBalance(deployer.address);
        expect(deployerBalanceAfter).to.be.equal(deployerBalanceBefore.add(MINT_PRICE.mul(2)))
    });

    it('Failure minting tests', async function () {
        await expect(nft.connect(user).mint(20)).to.be.revertedWith("wrong _mintAmount")
        await expect(nft.connect(user).mint(1)).to.be.revertedWith("not enough ETH")
        await expect(nft.connect(user).mint(4, {value: MINT_PRICE.mul(4)})).to.be.revertedWith("exceeded MAX_PER_WALLET")
    });

    it('Pause tests', async function () {
        await expect(nft.connect(user).pause(true)).to.be.revertedWith("Ownable: caller is not the owner")
        await nft.pause(true);
        await expect(nft.connect(user).mint(1, {value: MINT_PRICE})).to.be.revertedWith("contract is paused")
        await nft.pause(false);
        await nft.connect(user).mint(1, {value: MINT_PRICE})
        expect(await nft.balanceOf(user.address)).to.be.equal(3)
    });

    it('Test Exploit', async function () {
        
    });

    after(async function () {

        // User can't mint nfts even though he is eligable for 2 additional mints
        await expect(nft.connect(user).mint(1, {value: MINT_PRICE})).to.be.reverted;
    });
});