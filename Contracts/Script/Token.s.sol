// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/Token.sol";

contract DeployToken is Script {
    function run() external {
        string memory name = "Fluxin"; 
        string memory symbol = "Fluxin"; 
        uint256 initialSupply = 1000000 * 10 ** 18; 

        // Start broadcasting the transaction
        vm.startBroadcast();

        // Deploy the Token contract
        Token token = new Token(name, symbol, initialSupply);

        // Log the deployed contract address
        console.log("Deployed Token Contract at:", address(token));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
