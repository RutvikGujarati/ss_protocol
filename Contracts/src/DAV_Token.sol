// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {STATEToken} from "./State_Token.sol";

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

    constructor(
        address _stateToken,
        address _liquidityWallet,
        address _developmentWallet,
		string memory tokenName,
        string memory TokenSymbol
    )
       ERC20(tokenName, TokenSymbol)
	// ERC20("DAV Token", "DAV") 
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
