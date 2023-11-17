//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

contract TestAuction {

    address payable public currentLeader;
    uint256 public highestBid;

    function bid() external payable {
        require(msg.value > highestBid, "msg.value must be higher than highestBid");

        require(currentLeader.send(highestBid), "Send failed");

        currentLeader = payable(msg.sender);
        highestBid = msg.value;
    }
}