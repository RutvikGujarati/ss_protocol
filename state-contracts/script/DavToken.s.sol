// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {DAV_V2_2} from "../src/DavToken.sol";

contract ScriptDAV is Script {
    function run() external {
        vm.startBroadcast();
        //NOTE: add correct wallets for Gov and Dev
        address liquidity = 0xBAaB2913ec979d9d21785063a0e4141e5B787D28;
        address DAVWallet = 0x5E19e86F1D10c59Ed9290cb986e587D2541e942C;
		address state = 0x50Bb32FCB594978967265135E4d41849d7F646e0;
        address Governanace = 0xBAaB2913ec979d9d21785063a0e4141e5B787D28;

        DAV_V2_2 dav = new DAV_V2_2(
            liquidity,
            DAVWallet,
            state,
            Governanace,
            "mDAV",
            "mDAV"
        );

        console.log("Contract deployed at:", address(dav));

        vm.stopBroadcast();
    }
}
//0x6F97Abbf8098b4E3A3ed41F2f10F512D92c3f15A
