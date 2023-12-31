//SPDX-License-Identifier: Unlicensed
pragma solidity 0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ShibaToken is ERC20Burnable, Ownable(msg.sender) {
    constructor(uint _initialSupply) ERC20("Shiba Token", "SHIBA") {
        mint(msg.sender, _initialSupply);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}