// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Token - ERC20 token with initial distribution between governance and swap treasury
/// @author
/// @notice This contract mints a fixed maximum supply and distributes initial tokens to governance and swap treasury addresses.
/// @dev The contract inherits from OpenZeppelin's ERC20 and Ownable contracts.
contract Token is ERC20, Ownable {
    /// @notice The maximum total supply of tokens (500 billion tokens with 18 decimals)
    uint256 public constant MAX_SUPPLY = 500000000000 ether; // 500 billion

    /**
     * @notice Constructs the Token contract and mints initial tokens
     * @param name The name of the ERC20 token
     * @param symbol The symbol of the ERC20 token
     * @param _gov The address of the governance wallet receiving 1% of total supply
     * @param _swapTreasury The address of the swap treasury wallet receiving 99% of total supply
     * @param _owner The owner of the contract (Ownable)
     * @dev Requires valid non-zero addresses for governance, swap treasury, and owner.
     *      Mints 1% of MAX_SUPPLY to governance address, 99% to swap treasury.
     */
    constructor(
        string memory name,
        string memory symbol,
        address _gov,
        address _swapTreasury,
        address _owner
    ) ERC20(name, symbol) Ownable(_owner) {
        require(
            _gov != address(0) && _swapTreasury != address(0),
            "Invalid address"
        );
        require(_owner != address(0), "Invalid owner address");

        uint256 onePercent = (MAX_SUPPLY * 1) / 100;
        uint256 ninetyNinePercent = MAX_SUPPLY - onePercent;

        _mint(_gov, onePercent);
        _mint(_swapTreasury, ninetyNinePercent);
    }
}
