// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0xBAaB2913ec979d9d21785063a0e4141e5B787D28;
        address Swap = 0x97d7b4d458C2d4CbFDd2Ee4585090FDD92249802;
        //NOTE: Mainnet token name is pSTATE
        STATE_V2_2 state = new STATE_V2_2("pSTATE", "pSTATE", Five, Swap);

        console.log("rievaollar deployed at:", address(state));

        vm.stopBroadcast();
    }
}
//0x27650912642DBb46677408CC14A97Afb8A2e11c5
