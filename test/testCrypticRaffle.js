const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');

describe("Test Smart Contract", function () {
  
  let attacker;
  let crypticRaffle;

  const CRYPTIC_RAFFLE_ABI = fs.readFileSync("./test/CrypticRaffle.json").toString()
  const CRYPTIC_RAFFLE_ADDRESS = "0xca0B461f6F8Af197069a68f5f8A263b497569140"

  const PARTICIPATION_PRICE = ethers.utils.parseEther('0.01');

  before(async () => {

    [addictedGambler1, addictedGambler2, attacker] = await ethers.getSigners();

    // Set attacker balance to 0.1 ETH
    await ethers.provider.send("hardhat_setBalance", [
      attacker.address,
      "0x16345785D8A0000", // 0.1 ETH (ETH -> WEI -> Hexdecimal)
    ]);
    attackerInitialBalance = await ethers.provider.getBalance(attacker.address);
    console.log("Attacker initial balance: ", ethers.utils.formatUnits(attackerInitialBalance), " ETH")

    // Load CrypticRaffle Contract
    crypticRaffle = new ethers.Contract(
      CRYPTIC_RAFFLE_ADDRESS, CRYPTIC_RAFFLE_ABI, addictedGambler1
    )
    
    // addictedGambler1 is trying his strategy
    let numbers;
    for(let i=0; i < 100; i++){
      numbers = [i, 20 + i, 100 - i];
      await crypticRaffle.connect(addictedGambler1).guessNumbers(
          numbers, {value: PARTICIPATION_PRICE}
      )
    }

    // addictedGambler2 is trying his strategy
    for(let i=0; i < 100; i++){
      numbers = [i + 1, i + 2, 0];
      await crypticRaffle.connect(addictedGambler2).guessNumbers(
          numbers, {value: PARTICIPATION_PRICE}
      )
    }

    initialCrypticRaffleBalance = await ethers.provider.getBalance(crypticRaffle.address);
    console.log("crypticRaffle initial balance (pot): ", ethers.utils.formatUnits(initialCrypticRaffleBalance), " ETH")
  })

  it("Test Exploit", async () => {    

  })

  after(async () => {

    // No ETH in the cryptoRaffle contract
    const currentCrypticRaffleBalance = await ethers.provider.getBalance(crypticRaffle.address);
    console.log("crypticRaffle current balance: ", ethers.utils.formatUnits(currentCrypticRaffleBalance), " ETH")
    expect(currentCrypticRaffleBalance).to.eq(0)

    // Attacker was able to guess the numbers and get all the ETH
    // - 0.1 ETH for transaction fees
    const currentAttackerBalance = await ethers.provider.getBalance(attacker.address)
    console.log("Attacker current balance: ", ethers.utils.formatUnits(currentAttackerBalance), " ETH")
    expect(currentAttackerBalance).to.be.gt(
      attackerInitialBalance.add(initialCrypticRaffleBalance).sub(ethers.utils.parseEther('0.1'))
    )
  
  })
});