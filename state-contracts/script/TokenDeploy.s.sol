// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0xBAaB2913ec979d9d21785063a0e4141e5B787D28;
        address Swap = 0x1926Ae769Daa1039E6C27dDfCe7CE98534548b69;
        //NOTE: Mainnet token name is pSTATE
        STATE_V2_2 state = new STATE_V2_2("STATTE", "STATTE", Five, Swap);

        console.log("rievaollar deployed at:", address(state));

        vm.stopBroadcast();
    }
}
//0x27650912642DBb46677408CC14A97Afb8A2e11c5
