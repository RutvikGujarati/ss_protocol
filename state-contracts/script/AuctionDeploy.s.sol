//SPDX-Licence-Identifier : MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {SWAP_V2_2} from "../src/AuctionSwap.sol";
contract AuctionSwapDeploy is Script {
    function run() external {
        address governance = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;
        address DAVWallet =  0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;

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
