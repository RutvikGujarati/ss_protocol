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
    STATEToken public stateToken; // Reference to the STATE Token Contract
    uint256 public totalBatchesReleased = 1;
    uint256 public totalTokensReleased = 1000000 ether;

    event TokensMinted(
        address indexed user,
        uint256 davAmount,
        uint256 stateAmount
    );
    struct LastTransaction {
        uint256 amount; // Amount transferred
        address recipient; // Recipient address
        uint256 timestamp; // Block timestamp of the transaction
    }

    // State variables to track the last transaction details
    LastTransaction public lastLiquidityTransaction;
    LastTransaction public lastDevelopmentTransaction;

    event BatchReleased(uint256 batchNumber);
    mapping(address => bool) private davHolderExists;
    address[] private davHolders;

    constructor(
        address _stateToken,
        address _liquidityWallet,
        address _developmentWallet,
        address Governance,
        string memory tokenName,
        string memory TokenSymbol
    )
        ERC20(tokenName, TokenSymbol) // ERC20("DAV Token", "DAV")
    {
        stateToken = STATEToken(_stateToken);
        liquidityWallet = _liquidityWallet;
        developmentWallet = _developmentWallet;
        governanceAddress = Governance;
    }

    address public governanceAddress;

    // Modifier to check if the sender is the governance address
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    function setGovernanceAddress(
        address _newGovernance
    ) public onlyGovernance {
        governanceAddress = _newGovernance;
    }

    uint256 public totalLiquidityTransferred; // Tracks the total amount sent to the liquidity wallet

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

        // Get adjusted state reward and liquidity reward
        uint256 adjustedReward = getAdjustedReward(amount);
        uint256 liquidityReward = getLiquidityReward(amount);

        // Ensure the contract has enough STATE tokens for rewards
        require(
            stateToken.balanceOf(address(this)) >=
                adjustedReward + liquidityReward,
            "Insufficient STATE in treasury"
        );

        // Mint DAV tokens to user
        _mint(msg.sender, amount);
        mintedSupply += amount;

        // Track the user as a DAV holder
        trackDAVHolder(address(0), msg.sender);

        // Mint adjusted STATE tokens to user
        stateToken.transfer(msg.sender, adjustedReward);

        stateToken.transfer(liquidityWallet, liquidityReward);
        totalLiquidityTransferred += liquidityReward;
        distributeFunds();

        emit TokensMinted(msg.sender, amount, adjustedReward);
    }

    /**
     * @dev Calculate the STATE reward based on the current batch.
     * @param amount The amount of DAV tokens minted.
     * @return The amount of STATE tokens to mint.
     */
    function getAdjustedReward(uint256 amount) public view returns (uint256) {
        uint256 baseReward = INITIAL_STATE_REWARD -
            (currentBatch - 1) *
            STATE_REWARD_DECREMENT;
        uint256 totalReward = (amount / 1 ether) * baseReward;
        return totalReward;
    }

    function getLiquidityReward(uint256 amount) public view returns (uint256) {
        uint256 baseReward = INITIAL_STATE_REWARD -
            (currentBatch - 1) *
            STATE_REWARD_DECREMENT;
        uint256 totalReward = (amount / 1 ether) * baseReward;
        uint256 liquidityReward = (totalReward * 35) / 1000; // 3.5% of the reward
        return liquidityReward;
    }

    function getCurrentStateReward() public view returns (uint256) {
        uint256 currentBatched = (mintedSupply / BATCH_SIZE) + 1;
        uint256 baseReward = INITIAL_STATE_REWARD -
            (currentBatched - 1) *
            STATE_REWARD_DECREMENT;
        require(baseReward >= 0, "Reward cannot be negative");
        return baseReward;
    }

    uint256 public totalLiquidityAllocated;
    uint256 public totalDevelopmentAllocated;

    function distributeFunds() internal {
        uint256 liquidityShare = (msg.value * 95) / 100;
        uint256 developmentShare = msg.value - liquidityShare;

        // Update cumulative totals
        totalLiquidityAllocated += liquidityShare;
        totalDevelopmentAllocated += developmentShare;
        lastLiquidityTransaction = LastTransaction({
            amount: liquidityShare,
            recipient: liquidityWallet,
            timestamp: block.timestamp
        });

        // Update last transaction details for development
        lastDevelopmentTransaction = LastTransaction({
            amount: developmentShare,
            recipient: developmentWallet,
            timestamp: block.timestamp
        });

        // Transfer funds
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
     * @dev Distribute incoming PLS funds.
     */

    function calculateShare(
        uint256 totalAmount,
        uint256 percentage
    ) public pure returns (uint256) {
        require(percentage <= 100, "Invalid percentage");
        return (totalAmount * percentage) / 100;
    }

    function withdrawLiquidityShare() external onlyGovernance {
        uint256 liquidityShare = calculateShare(address(this).balance, 95);
        require(
            address(this).balance >= liquidityShare,
            "Insufficient balance"
        );

        (bool successLiquidity, ) = liquidityWallet.call{value: liquidityShare}(
            ""
        );
        require(successLiquidity, "Liquidity transfer failed");

        emit FundsWithdrawn(msg.sender, liquidityWallet, liquidityShare);
    }

    function withdrawDevelopmentShare() external onlyGovernance {
        uint256 developmentShare = calculateShare(address(this).balance, 5);
        require(
            address(this).balance >= developmentShare,
            "Insufficient balance"
        );

        (bool successDevelopment, ) = developmentWallet.call{
            value: developmentShare
        }("");
        require(successDevelopment, "Development transfer failed");

        emit FundsWithdrawn(msg.sender, developmentWallet, developmentShare);
    }

    function balacneETH() public view returns (uint256) {
        return address(this).balance;
    }

    // Event for logging withdrawals
    event FundsWithdrawn(
        address indexed executor,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @dev Release the next batch of DAV tokens for minting.
     */

    function releaseNextBatch() external onlyGovernance {
        require(
            currentBatch * BATCH_SIZE < MAX_SUPPLY,
            "No more batches available"
        );

        // Update tracking variables
        totalBatchesReleased++;
        totalTokensReleased += BATCH_SIZE;

        currentBatch++;
        emit BatchReleased(currentBatch);
    }

    /**
     * @dev Update the STATE token contract address.
     * @param _stateToken The address of the new STATE token contract.
     */
    function updateStateToken(address _stateToken) external onlyGovernance {
        require(_stateToken != address(0), "Invalid address");
        stateToken = STATEToken(_stateToken);
    }

    /**
     * @dev Update the liquidity wallet address.
     * @param _liquidityWallet The new liquidity wallet address.
     */
    function updateLiquidityWallet(
        address _liquidityWallet
    ) external onlyGovernance {
        require(_liquidityWallet != address(0), "Invalid address");
        liquidityWallet = _liquidityWallet;
    }

    /**
     * @dev Update the development wallet address.
     * @param _developmentWallet The new development wallet address.
     */
    function updateDevelopmentWallet(
        address _developmentWallet
    ) external onlyGovernance {
        require(_developmentWallet != address(0), "Invalid address");
        developmentWallet = _developmentWallet;
    }

    /**
     * @dev Fallback function to accept PLS.
     */
    receive() external payable {}
}
