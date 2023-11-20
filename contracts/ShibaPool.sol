//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IReceiver {
    function getTokens(address tokenAddress, uint256 amount) external;
}

contract ShibaPool is ReentrancyGuard {

    IERC20 public immutable shibaToken;
    uint256 public poolBalance;

    constructor(address tokenAddress) {
        shibaToken = IERC20(tokenAddress);
    }

    function depositTokens(uint256 amount) external nonReentrant {

        require(amount > 0, "amount should be greater than 0");
        shibaToken.transferFrom(msg.sender, address(this), amount);
        poolBalance = poolBalance + amount;
    }

    function flashLoan(uint256 borrowAmount) external nonReentrant {

        require(borrowAmount > 0, "amount should be greater than 0");
        uint256 balanceBefore = shibaToken.balanceOf(address(this));
        require(poolBalance == balanceBefore, "Accounting Issue");
        require(balanceBefore >= borrowAmount, "Not enough tokens in pool");

        shibaToken.transfer(msg.sender, borrowAmount);
        IReceiver(msg.sender).getTokens(address(shibaToken), borrowAmount);
        
        uint256 balanceAfter = shibaToken.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "Flash loan hasn't been paid back");
    }
}