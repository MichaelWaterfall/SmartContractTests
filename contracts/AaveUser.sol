//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AaveInterfaces.sol";

contract AaveUser is Ownable(msg.sender) {

    constructor(address _pool, address _usdc, address _dai) {

    }

    function depositUSDC(uint256 _amount) external onlyOwner {
       
        
    }

    function withdrawUSDC(uint256 _amount) external onlyOwner {
       

    }

    function borrowDAI(uint256 _amount) external onlyOwner {
      

    }

    function repayDAI(uint256 _amount) external onlyOwner {
        
    }
}