const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('test Smart Contract', function () {
  let deployer, user, attacker;
  let referrals, referralCode;

  before(async function () {

    [deployer, user, attacker] = await ethers.getSigners();

    // Deploy contract
    const referralsContract = await ethers.getContractFactory(
      'TestReferrals',
      deployer
    );
    referrals = await referralsContract.deploy();

    // Send some random tx's
    for (let i = 0; i < 100; i++) {
      await deployer.sendTransaction({
        to: ethers.Wallet.createRandom().address,
        value: ethers.utils.parseEther('0.01'),
      });
    }

    // Assign referal code to user
    referralCode = ethers.utils.keccak256(user.address);
    await referrals.connect(user).createReferralCode(referralCode);
  });

  it('Test Exploit', async function () {

  });

  after(async function () {

    // Mine all the transactions
    await ethers.provider.send('evm_mine', []);

    // Attacker should steal the user's refferal code
    expect(await referrals.getReferral(referralCode)).to.equal(attacker.address);
    
  });
  
});