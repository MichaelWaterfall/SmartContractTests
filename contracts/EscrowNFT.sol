//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowNFT is ERC721Burnable, Ownable {

    uint256 public tokenCounter;

    // NFT data
    mapping(uint256 => uint256) public amount;
    mapping(uint256 => uint256) public matureTime;

    constructor() ERC721("EscrowNFT", "ESCRW") {}

    function mint(address _recipient, uint256 _amount, uint256 _matureTime) 
    public onlyOwner returns (uint256) {

        // increment counter
        tokenCounter++;

        // set values
        amount[tokenCounter] = _amount;
        matureTime[tokenCounter] = _matureTime;

        _mint(_recipient, tokenCounter);

        return tokenCounter; // return ID
    }

    function tokenDetails(uint256 _tokenId) public view returns (uint256, uint256) {
        require(_exists(_tokenId), "EscrowNFT: Query for nonexistent token");

        return(amount[_tokenId], matureTime[_tokenId]);
    }
}