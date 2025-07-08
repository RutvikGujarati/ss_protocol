// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;
        address Swap = 0x89DAc4E381B85C4764003f5b97506b41AeF3a648;
        //NOTE: Mainnet token name is pSTATE
        STATE_V2_2 state = new STATE_V2_2("pSTATE", "pSTATE", Five, Swap);

        console.log("rievaollar deployed at:", address(state));

        vm.stopBroadcast();
    }
}
//0x27650912642DBb46677408CC14A97Afb8A2e11c5
