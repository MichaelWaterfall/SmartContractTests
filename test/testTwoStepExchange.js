const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("Test Smart Contract", function () {

  let keeper, attacker, exchange, weth, usdc, orderCreationBlockNumber;

  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const ORDER_CREATION_PRICE = ethers.utils.parseEther("5000", 6); // 5,000 USDC per ETH

  const getKeeperPriceParams = (price, blockNumber) => ({
    price,
    blockNumber,
  });

  before(async () => {

    [keeper, attacker] = await ethers.getSigners();

    weth = await ethers.getContractAt(
      "contracts/interfaces/IWETH9.sol:IWETH9",
      WETH
    );
    usdc = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      USDC
    );

    const TwoStepExchangeFactory = await ethers.getContractFactory(
      "TestTwoStepExchange",
      keeper
    );
    exchange = await TwoStepExchangeFactory.deploy();
  });

  it("Test Exploit", async () => {

    await expect(exchange
      .connect(keeper)
      .executeSwapOrder(
        1,
        getKeeperPriceParams(ORDER_CREATION_PRICE, orderCreationBlockNumber)
      )).to.be.reverted;
    
    // 100 blocks have gone by and the price of Ether has appreciated to $6,000
    await mine(100);

    
    
  });

  after(async () => {
    await expect(
      exchange
        .connect(keeper)
        .executeSwapOrder(
          1,
          getKeeperPriceParams(ORDER_CREATION_PRICE, orderCreationBlockNumber)
        )
    )
      .to.emit(exchange, "SwapOrderExecuted")
      .withArgs(1, ORDER_CREATION_PRICE);
  });
});