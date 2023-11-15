//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenSale is ERC20("BestToken", "BST"), Ownable(msg.sender) {

    mapping(address => uint[]) invested;
    address[] investors;

    event DistributedTokens(address to, uint amount);
 
    function invest() public payable {
        investors.push(msg.sender);
        invested[msg.sender].push(msg.value * 5);
    }
 
    function distributeTokens() public onlyOwner {

        for(uint i = 0; i < investors.length; i++) {
            
            address currentInvestor = investors[i];
            uint[] memory userInvestments = invested[currentInvestor];

            // investor => [0.0000001, 0.00000001, .....]
            for(uint i = 0; i < userInvestments.length; i++) {
                _mint(currentInvestor, userInvestments[i]);
                emit DistributedTokens(currentInvestor, userInvestments[i]);
            }
        }
    }

    function withdrawETH() public onlyOwner {
        bool sent = payable(msg.sender).send(address(this).balance);
        require(sent, "Failed to send Ether");
    }

    function claimable(address account, uint investmentID) public view returns (uint) {
        return invested[account][investmentID];
    }

}
