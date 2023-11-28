//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.13;

interface IYieldContract {
    function underlying() external view returns (address);
    function balanceOf(address) external view returns (uint256);
    function deposit(uint256) external;
    function withdraw(uint256) external;
    function claimRewards() external;
}