// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {SWAP_V3} from "../src/AuctionSwap.sol";
contract AuctionSwapDeploy is Script {
    function run() external {
        address governance = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address DAVWallet =  0x1262f7De33bA34C9373C20199fAb73CaCE13B5E9;

        vm.startBroadcast();

        SWAP_V3 swap = new SWAP_V3(
            governance,
            DAVWallet
        );
        console.log("Swap deployed at:", address(swap));
        vm.stopBroadcast();
    }
}
