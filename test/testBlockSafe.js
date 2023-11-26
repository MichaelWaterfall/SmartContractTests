const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let blockSafe1, blockSafe2, blockSafe3, blockSafeTemplate;
    let deployer, user1, user2, user3, attacker;
    const CALL_OPERATION = 1;
    const DELEGATECALL_OPERATION = 2;

    before(async function () {

        [deployer, user1, user2, user3, attacker] = await ethers.getSigners();

        // Deploy ERC20 Token
        const TokenFactory = await ethers.getContractFactory(
            'contracts/utils/DummyERC20.sol:DummyERC20',
            deployer
        );
        token = await TokenFactory.deploy("Dummy ERC20", "DToken", ethers.utils.parseEther('1000'))

        // Deploy Template and Factory
        const BlockSafeTemplateFactory = await ethers.getContractFactory(
            'TestBlockSafe',
            deployer
        );
        blockSafeTemplate = await BlockSafeTemplateFactory.deploy();
        const BlockSafeFactoryFactory = await ethers.getContractFactory(
            'TestBlockSafeFactory',
            deployer
        );
        blockSafeFactory = await BlockSafeFactoryFactory.deploy(
            deployer.address, blockSafeTemplate.address
        );

        // User1 creating CryptoKeepers
        const User1Salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(user1.address));
        const blockSafe1Address = await blockSafeFactory.predictBlockSafeAddress(User1Salt);
        await blockSafeFactory.connect(user1).createBlockSafe(User1Salt, [user1.address])
        blockSafe1 = await ethers.getContractAt(
            'TestBlockSafe',
            blockSafe1Address
        );
        // User2 creating CryptoKeepers
        const User2Salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(user2.address));
        const blockSafe2Address = await blockSafeFactory.predictBlockSafeAddress(User2Salt);
        await blockSafeFactory.connect(user2).createBlockSafe(User2Salt, [user2.address])
        blockSafe2 = await ethers.getContractAt(
            'TestBlockSafe',
            blockSafe2Address
        );
        // User3 creating CryptoKeepers
        const User3Salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(user3.address));
        const blockSafe3Address = await blockSafeFactory.predictBlockSafeAddress(User3Salt);
        await blockSafeFactory.connect(user3).createBlockSafe(User3Salt, [user3.address])
        blockSafe3 = await ethers.getContractAt(
            'TestBlockSafe',
            blockSafe3Address
        );
        
        // Users load their Block Safe with some ETH
        await user1.sendTransaction({
            to: blockSafe1.address,
            value: ethers.utils.parseEther('10')
        });
        await user2.sendTransaction({
            to: blockSafe2.address,
            value: ethers.utils.parseEther('10')
        });
        await user3.sendTransaction({
            to: blockSafe3.address,
            value: ethers.utils.parseEther('10')
        });

        // Block Safe operation works
        blockSafe1.connect(user1).executeWithValue(
            user2.address, "0x", ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('1')}
        )
        blockSafe2.connect(user2).executeWithValue(
            user1.address, "0x", ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('1')}
        )
        blockSafe3.connect(user3).executeWithValue(
            user1.address, "0x", ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('1')}
        )

        // Only operator can manage wallet
        // addOperator fails
        await expect(blockSafe1.connect(user2).addOperator(user2.address)).to.be.revertedWith("Not an operator")
        // executeWithValue fails
        await expect(blockSafe1.connect(user2).executeWithValue(
            user2.address, "0x", ethers.utils.parseEther('1'))).to.be.revertedWith("Not an operator")
        // execute fails
        const callData = TokenFactory.interface.encodeFunctionData('balanceOf', [deployer.address])
        await expect(blockSafe1.connect(user2).execute(
            token.address, callData, CALL_OPERATION)).to.be.revertedWith("Not an operator");

        attackerInitialBalance = await ethers.provider.getBalance(attacker.address);
        
    });

    it('Test Exploit', async function () {

    });

    after(async function () {

        // All safes should be non functional and frozen
        // And we can't withdraw ETH from the safes
        let safe1BalanceBefore = await ethers.provider.getBalance(blockSafe1.address)
        await blockSafe1.connect(user1).executeWithValue(
            user1.address, "0x", ethers.utils.parseEther('10')
        )
        expect(await ethers.provider.getBalance(blockSafe1.address)).to.eq(safe1BalanceBefore)

        let safe2BalanceBefore = await ethers.provider.getBalance(blockSafe2.address)
        await blockSafe2.connect(user2).executeWithValue(
            user2.address, "0x", ethers.utils.parseEther('10')
        )
        expect(await ethers.provider.getBalance(blockSafe2.address)).to.eq(safe2BalanceBefore)

        let safe3BalanceBefore = await ethers.provider.getBalance(blockSafe3.address)
        await blockSafe3.connect(user3).executeWithValue(
            user3.address, "0x", ethers.utils.parseEther('10')
        )
        expect(await ethers.provider.getBalance(blockSafe3.address)).to.eq(safe3BalanceBefore)

    });
});