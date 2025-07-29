// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address Swap = 0x870280Fd978EFf5A7B630C07982975E44AAe659E;
        //NOTE: Mainnet token name is pSTATE
        STATE_V2_2 state = new STATE_V2_2("pSTATE", "pSTATE", Five, Swap);

        console.log("rievaollar deployed at:", address(state));

        vm.stopBroadcast();
    }
}
//0x27650912642DBb46677408CC14A97Afb8A2e11c5
