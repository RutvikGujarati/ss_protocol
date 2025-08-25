// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {DAV_V3} from "../src/DavToken.sol";

contract ScriptDAV is Script {
    function run() external {
        vm.startBroadcast();
        //NOTE: add correct wallets for Gov and Dev
        address liquidity = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address DAVWallet = 0x1262f7De33bA34C9373C20199fAb73CaCE13B5E9;
		address state = 0xCF93C29db1D6A8dA724536E68ca413883f4Fd9a2;
        address Governanace = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;

        DAV_V3 dav = new DAV_V3(
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
