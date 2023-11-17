//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.13;

contract AttackTestAuction {

    interface IAttackTestAuction {
        function bid() external payable;
    }

    IAttackTestAuction auctionAddress;

    constructor(address _auctionAddress) {
        auction = IAttackTestAuction(_auctionAddress);
    }
}