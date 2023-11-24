const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Test Smart Contract', function () {

  let deployer, attacker;
  let usdc, secureStore;

  const INITIAL_SUPPLY = ethers.utils.parseEther('100')
  const ATTACKER_INITIAL_BALANCE = ethers.utils.parseEther('100')
  const STORE_INITIAL_BALANCE = ethers.utils.parseEther('100000')
  const DAILY_RENT_PRICE = ethers.utils.parseEther('50')

  before(async () => {

    [deployer, attacker] = await ethers.getSigners();

    // Deploy Contracts
    const RentingLibrary = await ethers.getContractFactory(
      'TestRentingLibrary',
      deployer
    );
    rentingLibrary = await RentingLibrary.deploy();
    // Deploy Token
    const dummyTokenFactory = await ethers.getContractFactory(
      'contracts/utils/DummyERC20.sol:DummyERC20',
      deployer
    );
    usdc = await dummyTokenFactory.deploy("USDC Token", "USDC", INITIAL_SUPPLY);
    const SecureStore = await ethers.getContractFactory(
      'TestSecureStore',
      deployer
    );
    secureStore = await SecureStore.deploy(rentingLibrary.address, DAILY_RENT_PRICE, usdc.address);

    // Setting up the attacker
    await usdc.mint(attacker.address, ATTACKER_INITIAL_BALANCE);

    // Setting up the SecureStore
    await usdc.mint(secureStore.address, STORE_INITIAL_BALANCE);

  });

  it('Test Exploit', async () => {

  });

  after(async () => {

    // Attacker stole all the funds from the SecureStore contract
    expect(await usdc.balanceOf(secureStore.address)).to.eq(0);
    expect(await usdc.balanceOf(attacker.address)).to.eq(ATTACKER_INITIAL_BALANCE.add(STORE_INITIAL_BALANCE));

  });
});