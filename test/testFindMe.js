const { ethers } = require('hardhat');
const { expect } = require('chai');
const { keccak256 } = require('ethers/lib/utils');

let deployer, user, attacker;
let findMe;

describe('Test Smart Contract', function () {
  before(async function () {

    [deployer, user, attacker] = await ethers.getSigners();
    this.attackerInitialBalance = await ethers.provider.getBalance(
      attacker.address,
    );

    const findMeContract = await ethers.getContractFactory(
      'TestFindMe',
      deployer
    );
    findMe = await findMeContract.deploy({
      value: ethers.utils.parseEther('10'),
    });

    const obfuscatedString = atob('RXRoZXJldW0=');
    await findMe.connect(user).claim(obfuscatedString);
  });

  it('Test Exploit', async function () {

  });

  after(async function () {
    
    // Mine all the transactions
    await ethers.provider.send('evm_mine', []);

    // Check if the attacker have in his balance at leat 9.9 more eth than what he had before
    const attackerBalance = await ethers.provider.getBalance(attacker.address);
    expect(attackerBalance).to.be.gt(
      attackerInitialBalance.add(ethers.utils.parseEther('9.9')),
    );
  });
});