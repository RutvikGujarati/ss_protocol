// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract STATEToken is ERC20, Ownable(msg.sender) {
    uint256 public constant INITIAL_SUPPLY = 999000000000000 ether; // 999 Trillion Tokens
    uint256 public constant MINT_THRESHOLD = 1000000000000 ether; // 1 Trillion Tokens
    uint256 public constant MINT_AMOUNT = 1000000000000 ether; // 1 Trillion Tokens
    address public constant burnAddress =
        0x0000000000000000000000000000000000000369; // Burn Address
    uint256 public burnedTokens;

    address public governanceAddress;

    // Modifier to check if the sender is the governance address
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    constructor(string memory tokenName, string memory TokenSymbol)
        // ERC20("pSTATE", "STATE")
        ERC20(tokenName, TokenSymbol)
    {
        _mint(address(this), INITIAL_SUPPLY); // Mint initial supply to the treasury
    }

    // Mint additional tokens when below threshold
    function mintAdditionalTokens() external onlyOwner {
        require(
            balanceOf(address(this)) < MINT_THRESHOLD,
            "Treasury has sufficient tokens"
        );
        _mint(address(this), MINT_AMOUNT);
    }

    // Move tokens from the treasury to any wallet
    function moveTokens(address to, uint256 amount) external onlyOwner {
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient tokens in treasury"
        );
        _transfer(address(this), to, amount);
    }

    /**
     * @dev Get the user's DAV token holdings in numbers.
     * @param user The address of the user.
     * @return The DAV token balance of the user.
     */
    function getDAVHoldings(address user) public view returns (uint256) {
        return balanceOf(user);
    }

    /**
     * @dev Get the user's percentage of total DAV token holdings.
     * @param user The address of the user.
     * @return The percentage of the user's holdings relative to total DAV supply.
     */
    function getUserHoldingPercentage(address user)
        public
        view
        returns (uint256)
    {
        uint256 userBalance = balanceOf(user);
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return 0;
        }
        return (userBalance * 1e18) / totalSupply; // Return percentage as a scaled value (1e18 = 100%).
    }

    // Burn tokens and track the burn amount
    function burnTokens(uint256 amount) external {
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient tokens in treasury"
        );
        _transfer(address(this), burnAddress, amount);
        burnedTokens += amount;
    }

    // Get the total burned tokens
    function getBurnedTokens() external view returns (uint256) {
        return burnedTokens;
    }
}
