const { ethers } = require('hardhat');
const { expect } = require('chai');


describe('Test Smart Contract', function () {


    let deployer, vouchersSigner, user, attacker;
    let redHawks;

    before(async function () {

        [deployer, vouchersSigner, user, attacker] = await ethers.getSigners();

        // Deploy the contract
        const RedHawksFactory = await ethers.getContractFactory(
            "TestRedHawksVIP",
            deployer
        );
        redHawks = await RedHawksFactory.deploy(vouchersSigner.address);
        
        // Create 2 NFTs voucher
        const domain = {
            chainId: await deployer.getChainId(), // Localhost Chain ID
            verifyingContract: redHawks.address
        }
        const types = {
            VoucherData: [
                { name: 'amountOfTickets', type: 'uint256' },
                { name: 'password', type: 'string' },
            ],
        }
        const dataToSign = {
            amountOfTickets: "2",
            password: "RedHawksRulzzz133",
        }

        // This is how the signature you found on Ethereum mempool was created
        validSignature = await vouchersSigner._signTypedData(
            domain,
            types,
            dataToSign,
        )
        // Invalid signature (signed by another account)
        invalidSignature = await deployer._signTypedData(
            domain,
            types,
            dataToSign,
        )
        
        // Invalid signer doesn't work
        await expect(redHawks.connect(user).mint(2, "RedHawksRulzzz133", invalidSignature)).to.be.revertedWith("Invalid voucher");

        // Invalid data doesn't work
        await expect(redHawks.connect(user).mint(2, "wrongPassword", validSignature)).to.be.revertedWith("Invalid voucher");

        // Can use valid voucher
        await redHawks.connect(user).mint(2, "RedHawksRulzzz133", validSignature)

        // 2 NFT minted
        expect(await redHawks.balanceOf(user.address)).to.be.equal(2);

        // Can't use voucher twice
        await expect(redHawks.connect(user).mint(2, "RedHawksRulzzz133", validSignature)).to.be.revertedWith("Voucher used");
    });

    it('Test Exploit', async function () {
        
    });

    after(async function () {
        expect(await redHawks.balanceOf(attacker.address)).to.be.equal(178);
    });
});