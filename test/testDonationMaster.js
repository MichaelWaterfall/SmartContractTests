const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Test Smart Contract', function () {

    let deployer, user1, user2, user3;
    let donationMaster, multiSig;

    const ONE_ETH = ethers.utils.parseEther('1'); // 100 ETH
    const HUNDRED_ETH = ethers.utils.parseEther('100'); // 100 ETH
    const THOUSAND_ETH = ethers.utils.parseEther('1000'); // 100 ETH

    before(async function () {

        [deployer, user1, user2, user3] = await ethers.getSigners();

        // Deploy DonationMaster contract
        const DonationMasterFactory = await ethers.getContractFactory(
            'TestDonationMaster',
            deployer
        );
        donationMaster = await DonationMasterFactory.deploy();

        // Deploy MultiSigSafe contract (2 signatures out of 3)
        const MultiSigSafeFactory = await ethers.getContractFactory(
            'TestMultiSigSafe',
            deployer
        );
        multiSig = await MultiSigSafeFactory.deploy(
            [user1.address, user2.address, user3.address], 2
        );
        
    });

    it('Donation tests', async function () {
        
        // New donation works
        await donationMaster.newDonation(multiSig.address, HUNDRED_ETH);
        let donationId = await donationMaster.donationsNo() - 1;

        // Donating to multisig wallet works
        await donationMaster.donate(donationId, {value: ONE_ETH});

        // Validate donation details
        let donationInfo = await donationMaster.donations(donationId);
        expect(donationInfo.id).to.equal(donationId);
        expect(donationInfo.to).to.equal(multiSig.address);
        expect(donationInfo.goal).to.equal(HUNDRED_ETH);
        expect(donationInfo.donated).to.equal(ONE_ETH);

        // Too big donation fails (goal reached)
        expect(donationMaster.donate(donationId, {value: THOUSAND_ETH})).to.be.reverted;
    });

    it('Fixed tests', async function () {

    });
});