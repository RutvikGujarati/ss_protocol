// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {STATEToken} from "./StateToken.sol";

contract DAVToken is ERC20, Ownable(msg.sender) {
    uint256 public constant MAX_SUPPLY = 5000000 ether; // 5 Million DAV Tokens
    uint256 public constant TOKEN_COST = 100000 ether; // 100,000 PLS per DAV
    uint256 public constant INITIAL_STATE_REWARD = 50000000 ether; // 50 Million STATE Tokens
    uint256 public constant STATE_REWARD_DECREMENT = 10000000 ether; // Decrease by 10 Million STATE
    uint256 public constant BATCH_SIZE = 1000000 ether; // 1 Million DAV Tokens per Batch

    uint256 public mintedSupply; // Total Minted DAV Tokens
    uint256 public currentBatch = 1; // Current Batch Number
    address public liquidityWallet; // Liquidity Wallet
    address public developmentWallet; // Development Wallet
    IERC20 public stateToken; // Reference to the STATE Token Contract

    event TokensMinted(
        address indexed user,
        uint256 davAmount,
        uint256 stateAmount
    );
    event BatchReleased(uint256 batchNumber);
    mapping(address => bool) private davHolderExists;
    address[] private davHolders;

    constructor(
        address _stateToken,
        address _liquidityWallet,
        address _developmentWallet,
        string memory tokenName,
        string memory TokenSymbol
    )
        ERC20(tokenName, TokenSymbol) // ERC20("DAV Token", "DAV")
    {
        stateToken = IERC20(_stateToken);
        liquidityWallet = _liquidityWallet;
        developmentWallet = _developmentWallet;
    }

    /**
     * @dev Mint DAV tokens by paying PLS.
     * @param amount The amount of DAV tokens to mint (in wei).
     */
    function mintDAV(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than zero");
        require(
            mintedSupply + amount <= currentBatch * BATCH_SIZE,
            "Batch limit exceeded"
        );
        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");

        uint256 cost = (amount / 1 ether) * TOKEN_COST;
        require(msg.value == cost, "Incorrect PLS amount sent");

        uint256 stateReward = getStateReward(amount);

        // Mint DAV tokens to user
        _mint(msg.sender, amount);
        mintedSupply += amount;

        // Mint STATE tokens to user

        require(
            stateToken.balanceOf(address(this)) >= stateReward,
            "Insufficient STATE in treasury"
        );

        stateToken.transfer(msg.sender, stateReward);

        // Distribute PLS
        distributeFunds();

        emit TokensMinted(msg.sender, amount, stateReward);
    }

    /**
     * @dev Internal function to track DAV holders.
     * Removes holders with a zero balance and adds new holders.
     */
    function trackDAVHolder(address from, address to) internal {
        // Remove `from` as a holder if their balance becomes zero
        if (
            from != address(0) && balanceOf(from) == 0 && davHolderExists[from]
        ) {
            davHolderExists[from] = false;
            _removeHolder(from);
        }

        // Add `to` as a holder if they are not already tracked and their balance is positive
        if (to != address(0) && !davHolderExists[to] && balanceOf(to) > 0) {
            davHolderExists[to] = true;
            davHolders.push(to);
        }
    }

    /**
     * @dev Internal function to remove a holder from the `davHolders` array.
     * @param holder The address of the holder to remove.
     */
    function _removeHolder(address holder) internal {
        for (uint256 i = 0; i < davHolders.length; i++) {
            if (davHolders[i] == holder) {
                davHolders[i] = davHolders[davHolders.length - 1];
                davHolders.pop();
                break;
            }
        }
    }

    /**
     * @dev Override `_transfer` to track holders on every transfer.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._transfer(from, to, amount);
        trackDAVHolder(from, to);
    }

    /**
     * @dev Fetch the list of all current DAV holders.
     * @return The array of DAV holder addresses.
     */
    function getDAVHolders() public view returns (address[] memory) {
        return davHolders;
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
    function getUserHoldingPercentage(
        address user
    ) public view returns (uint256) {
        uint256 userBalance = balanceOf(user);
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return 0;
        }
        return (userBalance * 1e18) / totalSupply; // Return percentage as a scaled value (1e18 = 100%).
    }

    /**
     * @dev Calculate the STATE reward based on the current batch.
     * @param amount The amount of DAV tokens minted.
     * @return The amount of STATE tokens to mint.
     */
    function getStateReward(uint256 amount) public view returns (uint256) {
        uint256 baseReward = INITIAL_STATE_REWARD -
            (currentBatch - 1) *
            STATE_REWARD_DECREMENT;
        return (amount / 1 ether) * baseReward;
    }

    /**
     * @dev Show the current STATE token reward per DAV token minted.
     * @return The current STATE token reward per DAV token.
     */
    function getCurrentStateReward() public view returns (uint256) {
        uint256 currentBatched = (mintedSupply / BATCH_SIZE) + 1;
        uint256 baseReward = INITIAL_STATE_REWARD -
            (currentBatched - 1) *
            STATE_REWARD_DECREMENT;
        require(baseReward >= 0, "Reward cannot be negative");
        return baseReward;
    }

    /**
     * @dev Distribute incoming PLS funds.
     */
    function distributeFunds() internal {
        uint256 liquidityShare = (msg.value * 95) / 100;
        uint256 developmentShare = msg.value - liquidityShare;

        (bool successLiquidity, ) = liquidityWallet.call{value: liquidityShare}(
            ""
        );
        require(successLiquidity, "Liquidity transfer failed");

        (bool successDevelopment, ) = developmentWallet.call{
            value: developmentShare
        }("");
        require(successDevelopment, "Development transfer failed");
    }

    /**
     * @dev Release the next batch of DAV tokens for minting.
     */
    function releaseNextBatch() external onlyOwner {
        require(
            currentBatch * BATCH_SIZE < MAX_SUPPLY,
            "No more batches available"
        );
        currentBatch++;
        emit BatchReleased(currentBatch);
    }

    /**
     * @dev Update the STATE token contract address.
     * @param _stateToken The address of the new STATE token contract.
     */
    function updateStateToken(address _stateToken) external onlyOwner {
        require(_stateToken != address(0), "Invalid address");
        stateToken = IERC20(_stateToken);
    }

    /**
     * @dev Update the liquidity wallet address.
     * @param _liquidityWallet The new liquidity wallet address.
     */
    function updateLiquidityWallet(
        address _liquidityWallet
    ) external onlyOwner {
        require(_liquidityWallet != address(0), "Invalid address");
        liquidityWallet = _liquidityWallet;
    }

    /**
     * @dev Update the development wallet address.
     * @param _developmentWallet The new development wallet address.
     */
    function updateDevelopmentWallet(
        address _developmentWallet
    ) external onlyOwner {
        require(_developmentWallet != address(0), "Invalid address");
        developmentWallet = _developmentWallet;
    }

    /**
     * @dev Fallback function to accept PLS.
     */
    receive() external payable {}
}
