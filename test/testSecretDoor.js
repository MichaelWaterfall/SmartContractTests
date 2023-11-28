const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');

describe("Test Smart Contract", function () {
  
  let muggle;
  let secretDoor;
  const SECRET_DOOR_ABI = fs.readFileSync("./test/SecretDoorABI.json").toString()
  const SECRET_DOOR_ADDRESS = "0x148f340701D3Ff95c7aA0491f5497709861Ca27D"

  before(async () => {

    [muggle] = await ethers.getSigners();
    // Load SecretDoor Contract
    secretDoor = new ethers.Contract(
      SECRET_DOOR_ADDRESS, SECRET_DOOR_ABI, muggle
    )

    await secretDoor.unlockDoor(ethers.utils.formatBytes32String("EatSlugs"));
  })

  it("Test Exploit", async () => {    
    
  })

  after(async () => {

    expect(await secretDoor.isLocked()).to.eq(false)
  })
});