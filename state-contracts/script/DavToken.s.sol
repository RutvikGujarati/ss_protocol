// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {DAV_V2_2} from "../src/DavToken.sol";

contract ScriptDAV is Script {
    function run() external {
        vm.startBroadcast();
        //NOTE: add correct wallets for Gov and Dev
        address liquidity = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;
        address DAVWallet = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;
		address state = 0x66d247796757B7867614642Be02568EE8e43E22a;
        address Governanace = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;

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
