// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {DAV_V2_2} from "../src/DavToken.sol";

contract ScriptDAV is Script {
    function run() external {
        vm.startBroadcast();
        //NOTE: add correct wallets for Gov and Dev
        address liquidity = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address DAVWallet = 0x1262f7De33bA34C9373C20199fAb73CaCE13B5E9;
		address state = 0xcE479a6C2C98Af48Cf2302486C96338B86a32a14;
        address Governanace = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;

        DAV_V2_2 dav = new DAV_V2_2(
            liquidity,
            DAVWallet,
            state,
            Governanace,
            "pDAV",
            "pDAV"
        );

        console.log("Contract deployed at:", address(dav));

        vm.stopBroadcast();
    }
}
//0x6F97Abbf8098b4E3A3ed41F2f10F512D92c3f15A
