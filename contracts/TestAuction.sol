// SCH Course Copyright Policy (C): DO-NOT-SHARE-WITH-ANYONE
//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

contract TestAuction {

    address payable public currentLeader;
    uint256 public highestBid;

    function bid() external payable {
        require(msg.value > highestBid);

        require(currentLeader.send(highestBid));

        currentLeader = payable(msg.sender);
        highestBid = msg.value;
    }
}