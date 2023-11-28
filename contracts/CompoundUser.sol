//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CompoundInterfaces.sol";

contract CompoundUser is Ownable(msg.sender) {

    IComptroller private comptroller;

    IERC20 private usdc;
    IERC20 private dai;

    cERC20 private cUsdc;
    cERC20 private cDai;

    uint256 public depositedAmount; // In USDC
    uint256 public borrowedAmount; // In DAI

    constructor(address _comptroller, address _cUsdc, address _cDai) {

    }

    // Deposit USDC to Compound
    function deposit(uint256 _amount) external onlyOwner {

    }

    // Allow the deposited USDC to be used as collateral, interact with the Comptroller contract
    function allowUSDCAsCollateral() external onlyOwner {
   
    }

    // Withdraw deposited USDC from Compound
    function withdraw(uint256 _amount) external onlyOwner {
     

    }

    // Borrow DAI from Compound
    function borrow(uint256 _amount) external {

    }

    
    function repay(uint256 _amount) external onlyOwner {

    }
}