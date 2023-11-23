//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestGoldToken is ERC20, Ownable(msg.sender) {

    constructor() ERC20("Gold Token", "GLD") {}

    function mint(address _to, uint _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _account, uint _amount) external onlyOwner {
        _burn(_account, _amount);
    }
}
