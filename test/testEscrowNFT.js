const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {
    
    let deployer, user1, user2, user3, attacker;
    let escrow, escrowNFT;

    const ONE_MONTH = 30 * 24 * 60 * 60;

    const USER1_ESCROW_AMOUNT = ethers.utils.parseEther('10'); // 10 ETH
    const USER2_ESCROW_AMOUNT = ethers.utils.parseEther('54'); // 54 ETH
    const USER3_ESCROW_AMOUNT = ethers.utils.parseEther('72'); // 72 ETH

    before(async function () {

        [deployer, user1, user2, user3, attacker] = await ethers.getSigners();

        // Set attacker balance to 2 ETH
        await ethers.provider.send("hardhat_setBalance", [
            attacker.address,
            "0x1BC16D674EC80000", // 2 ETH (ETH -> WEI -> Hexdecimal)
        ]);
        attackerInitialBalance = await ethers.provider.getBalance(attacker.address);

        // Deploy NFT
        const EscrowNFTFactory = await ethers.getContractFactory(
            'TestEscrowNFT',
            deployer
        );
       
        escrowNFT = await EscrowNFTFactory.deploy();
        
        // Deploy Escrow
        const EscrowFactory = await ethers.getContractFactory(
            'TestEscrow',
            deployer
        );
        escrow = await EscrowFactory.deploy(escrowNFT.address);
        
        // Transfer ownership of NFT contrct to Escrow contract
        await escrowNFT.transferOwnership(escrow.address);
    });

    it('Escrow NFT Tests', async function () {

        // Escrow 10 ETH from user1 to user2, one month treshold
        await escrow.connect(user1).escrowEth(
            user2.address, ONE_MONTH, {value: USER1_ESCROW_AMOUNT}
        );
        let tokenId = await this.escrowNFT.tokenCounter();

        // User2 can't withdraw before matureTime
        await escrowNFT.connect(user2).approve(escrow.address, tokenId);
        await expect(escrow.connect(user2).redeemEthFromEscrow(tokenId)).to.be.revertedWith(
            "Escrow period not expired."
        );
        
        // Fast forward to mature time
        await ethers.provider.send("evm_increaseTime", [ONE_MONTH]);

        // Another user can't withdraw if he doesn't own this NFT
        await expect(escrow.connect(user3).redeemEthFromEscrow(tokenId)).to.be.revertedWith(
            "Must own token to claim underlying ETH"
        );

        // Recipient can withdraw after matureTime
        await escrowNFT.connect(user2).approve(escrow.address, tokenId);
        let balanceBefore = await ethers.provider.getBalance(user2.address);
        await escrow.connect(user2).redeemEthFromEscrow(tokenId)
        let balanceAfter = await ethers.provider.getBalance(user2.address);
        expect(balanceAfter).to.be.greaterThan(
            balanceBefore.add(USER1_ESCROW_AMOUNT).sub(ethers.utils.parseEther('0.1'))
        );

    });

    it('Some users escrow more ETH', async function () {
        await escrow.connect(user1).escrowEth(user2.address, ONE_MONTH, {value: USER1_ESCROW_AMOUNT});
        await escrow.connect(user2).escrowEth(user1.address, ONE_MONTH, {value: USER2_ESCROW_AMOUNT});
        await escrow.connect(user3).escrowEth(user1.address, ONE_MONTH, {value: USER3_ESCROW_AMOUNT});
    });

    it('Test Exploit', async function () {

    });

    after(async function () {

        // Attacker should drain the escrow contract
        expect(await ethers.provider.getBalance(attacker.address)).to.be.greaterThan(
            attackerInitialBalance.add(USER1_ESCROW_AMOUNT).add(USER2_ESCROW_AMOUNT)
            .add(USER3_ESCROW_AMOUNT).sub(ethers.utils.parseEther('0.1'))
        );
    });


});