// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0xBAaB2913ec979d9d21785063a0e4141e5B787D28;
        address Swap = 0x7612e3911a2780C442C4B99FFEcb57080866447E;
        STATE_Token_V2_1_Ratio_Swapping state = new STATE_Token_V2_1_Ratio_Swapping(
                "$TATE1",
                "$TATE1",
                Five,
                Swap
            );

        console.log("rievaollar deployed at:", address(state));

        vm.stopBroadcast();
    }
}
//0x27650912642DBb46677408CC14A97Afb8A2e11c5