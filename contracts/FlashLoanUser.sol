//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IShibaPool {
    function flashLoan(uint256 borrowAmount) external;
}


contract FlashLoanUser is Ownable {

    IShibaPool private immutable pool;

    constructor(address poolAddress) {
        pool = IShibaPool(poolAddress);
    }

    function getTokens(address tokenAddress, uint256 amount) external {
        require(msg.sender == address(pool), "Sender must be pool");
        require(IERC20(tokenAddress).transfer(msg.sender, amount), "Transfer of tokens failed");
    }

    function requestFlashLoan(uint256 amount) external onlyOwner {
        pool.flashLoan(amount);
    }
}