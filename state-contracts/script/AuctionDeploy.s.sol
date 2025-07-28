// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {SWAP_V2_2} from "../src/AuctionSwap.sol";
contract AuctionSwapDeploy is Script {
    function run() external {
        address governance = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address DAVWallet =  0x1262f7De33bA34C9373C20199fAb73CaCE13B5E9;

        vm.startBroadcast();

        SWAP_V2_2 swap = new SWAP_V2_2(
            governance,
            DAVWallet
        );
        console.log("Swap deployed at:", address(swap));
        vm.stopBroadcast();
    }
}

//0x59589F149e9022f58E446d4A20a014c42541cA31
