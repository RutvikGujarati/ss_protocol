// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title STATE Token V2.1 with Ratio-Based Initial Supply Allocation
/// @author
/// @notice ERC20 token with 5/95 minting distribution between two addresses at deployment
/// @dev Uses OpenZeppelin ERC20 and Ownable contracts
contract STATE_Token_V2_1_Ratio_Swapping is ERC20, Ownable(msg.sender) {
    /// @notice Maximum total supply of the token (1 quadrillion tokens, 18 decimals)
    uint256 public constant MAX_TOTAL_SUPPLY = 1_000_000_000_000_000 ether;

    /// @param tokenName The name of the token
    /// @param tokenSymbol The symbol of the token
    /// @param recipientFivePercent Address receiving 5% of total supply
    /// @param recipientNinetyFivePercent Address receiving 95% of total supply
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        address recipientFivePercent,
        address recipientNinetyFivePercent
    ) ERC20(tokenName, tokenSymbol) {
        require(recipientFivePercent != address(0), "Invalid 5% address");
        require(
            recipientNinetyFivePercent != address(0),
            "Invalid 95% address"
        );

        uint256 fivePercentAllocation = (MAX_TOTAL_SUPPLY * 5) / 100;
        uint256 ninetyFivePercentAllocation = MAX_TOTAL_SUPPLY -
            fivePercentAllocation;

        _mint(recipientFivePercent, fivePercentAllocation);
        _mint(recipientNinetyFivePercent, ninetyFivePercentAllocation);
    }
}
