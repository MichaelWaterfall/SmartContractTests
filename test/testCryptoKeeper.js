const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let deployer, user1, user2, user3, attacker;
    let cryptoKeeper1, cryptoKeeper2, cryptoKeeper3;
    let token;

    const CALL_OPERATION = 1;

    before(async function () {

        [deployer, user1, user2, user3, attacker] = await ethers.getSigners();

        // Deploy ERC20 Token
        const TokenFactory = await ethers.getContractFactory(
            'contracts/utils/DummyERC20.sol:DummyERC20',
            deployer
        );
        token = await TokenFactory.deploy("Dummy ERC20", "DToken", ethers.utils.parseEther('1000'))

        // Deploy Template and Factory
        const CryptoKeeperTemplateFactory = await ethers.getContractFactory(
            'TestCryptoKeeper',
            deployer
        );
        cryptoKeeperTemplate = await CryptoKeeperTemplateFactory.deploy();
        const CryptoKeeperFactoryFactory = await ethers.getContractFactory(
            'TestCryptoKeeperFactory',
            deployer
        );
        cryptoKeeperFactory = await CryptoKeeperFactoryFactory.deploy(
            deployer.address, cryptoKeeperTemplate.address
        );

        // User1 creating CryptoKeepers
        const User1Salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(user1.address));
        const cryptoKeeper1Address = await cryptoKeeperFactory.predictCryptoKeeperAddress(User1Salt);
        await cryptoKeeperFactory.connect(user1).createCryptoKeeper(User1Salt, [user1.address])
        cryptoKeeper1 = await ethers.getContractAt(
            'TestCryptoKeeper',
            cryptoKeeper1Address
        );
        // User2 creating CryptoKeepers
        const User2Salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(user2.address));
        const cryptoKeeper2Address = await cryptoKeeperFactory.predictCryptoKeeperAddress(User2Salt);
        await cryptoKeeperFactory.connect(user2).createCryptoKeeper(User2Salt, [user2.address])
        cryptoKeeper2 = await ethers.getContractAt(
            'TestCryptoKeeper',
            cryptoKeeper2Address
        );
        // User3 creating CryptoKeepers
        const User3Salt = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(user3.address));
        const cryptoKeeper3Address = await cryptoKeeperFactory.predictCryptoKeeperAddress(User3Salt);
        await cryptoKeeperFactory.connect(user3).createCryptoKeeper(User3Salt, [user3.address])
        cryptoKeeper3 = await ethers.getContractAt(
            'TestCryptoKeeper',
            cryptoKeeper3Address
        );

        // Users load their cryptoKeeper with some ETH
        await user1.sendTransaction({
            to: cryptoKeeper1.address,
            value: ethers.utils.parseEther('10')
        });
        await user2.sendTransaction({
            to: cryptoKeeper2.address,
            value: ethers.utils.parseEther('10')
        });
        await user3.sendTransaction({
            to: cryptoKeeper3.address,
            value: ethers.utils.parseEther('10')
        });

        // cryptoKeeper operation works
        cryptoKeeper1.connect(user1).executeWithValue(
            user2.address, "0x", ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('1')}
        )
        cryptoKeeper2.connect(user2).executeWithValue(
            user1.address, "0x", ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('1')}
        )
        cryptoKeeper3.connect(user3).executeWithValue(
            user1.address, "0x", ethers.utils.parseEther('1'), {value: ethers.utils.parseEther('1')}
        )

        // Only operator can manage wallet
        // addOperator fails
        await expect(cryptoKeeper1.connect(user2).addOperator(user2.address)).to.be.revertedWith("Not an operator")
        // executeWithValue fails
        await expect(cryptoKeeper1.connect(user2).executeWithValue(
            user2.address, "0x", ethers.utils.parseEther('1'))).to.be.revertedWith("Not an operator")
        // execute fails
        const callData = TokenFactory.interface.encodeFunctionData('balanceOf', [deployer.address])
        await expect(cryptoKeeper1.connect(user2).execute(
            token.address, callData, CALL_OPERATION)).to.be.revertedWith("Not an operator");

        attackerInitialBalance = await ethers.provider.getBalance(attacker.address);
        
    });

    it('Test Exploit', async function () {

    });

    after(async function () {

        // Attacker suppose to steal all the ETH from the Crypto Keepers
        expect(await ethers.provider.getBalance(cryptoKeeper1.address)).to.eq(0);
        expect(await ethers.provider.getBalance(cryptoKeeper2.address)).to.eq(0);
        expect(await ethers.provider.getBalance(cryptoKeeper3.address)).to.eq(0);
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(attackerInitialBalance.add(ethers.utils.parseEther('30')).sub(ethers.utils.parseEther('0.2')));

    });
});