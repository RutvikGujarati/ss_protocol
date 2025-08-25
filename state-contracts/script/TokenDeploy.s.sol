// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address Swap = 0x97d7b4d458C2d4CbFDd2Ee4585090FDD92249802;
        //NOTE: Mainnet token name is pSTATE
        STATE_V3 state = new STATE_V3("pSTATE", "pSTATE", Five, Swap);

        console.log("state deployed at:", address(state));

        vm.stopBroadcast();
    }
}
