// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/StateToken.sol";

contract DeployState is Script {
    function run() external {
        vm.startBroadcast();
        address Five = 0x98b0379474Cf84Ab257bEe0b73dceb11051223A5;
        address Swap = 0xD1C3485Cc4cc39F21Fe7779998F08eC141f7A7dA;
        //NOTE: Mainnet token name is pSTATE
        STATE_V3 state = new STATE_V3("pSTATE", "pSTATE", Five, Swap);

        console.log("state deployed at:", address(state));

        vm.stopBroadcast();
    }
}
