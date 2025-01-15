// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {STATE_Token_V1_0_Ratio_Swapping} from "./StateToken.sol";

contract AuctionRatioSwapping {
    address public admin;
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;
    uint256 public tokenAllocationPercentage = 1; // Default to 1% of supply
    uint256 public burnPercentage = 10; // Default to 10% of collected tokens

    bool public isPaused = false;
    bool public isStopped = false;

    struct Vault {
        uint256 totalDeposited;
        uint256 totalAuctioned;
    }

    struct Auction {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address tokenIn;
        address tokenOut;
        uint256 collectionPercentage; // Percentage of tokenIn supply to collect
    }

    struct UserSwap {
        uint256 totalSwapped;
        mapping(address => uint256) tokenSwapped; // Track amounts per token
    }

    mapping(address => Vault) public vaults;
    mapping(address => bool) public supportedTokens;
    mapping(address => UserSwap) public userSwaps;
    mapping(address => uint256) public totalBurnedTokens; // Track total burned tokens per token
    mapping(address => uint256) public tokenAuctionPercentage; // Allocation percentage per token

    Auction public currentAuction;

    event TokensDeposited(address indexed token, uint256 amount);
    event AuctionStarted(
        uint256 startTime,
        uint256 endTime,
        address tokenIn,
        address tokenOut,
        uint256 collectionPercentage
    );
    event TokensSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event TokensBurned(address indexed token, uint256 amountBurned);
    event ContractPaused(bool isPaused);
    event ContractStopped(bool isStopped);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier notPausedOrStopped() {
        require(!isPaused, "Contract is paused");
        require(!isStopped, "Contract is stopped");
        _;
    }

    constructor(address _gov) {
        admin = msg.sender;
        governanceAddress = _gov;
    }

    address private governanceAddress;
    event GovernanceChanged(
        address indexed oldGovernance,
        address indexed newGovernance
    );
    event RewardDistributed(address indexed user, uint256 amount);

    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "Swapping: You are not authorized to perform this action"
        );
        _;
    }

    function setGovernanceAddress(address _newGovernance)
        external
        onlyGovernance
    {
        require(
            _newGovernance != address(0),
            "New governance address cannot be zero"
        );
        governanceAddress = _newGovernance;
        emit GovernanceChanged(governanceAddress, _newGovernance);
    }

    function depositTokens(address token, uint256 amount) external onlyAdmin {
        require(supportedTokens[token], "Unsupported token");

        Vault storage vault = vaults[token];
        vault.totalDeposited += amount;

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit TokensDeposited(token, amount);
    }

    function startAuction(
        address tokenIn,
        address tokenOut,
        uint256 collectionPercentage
    ) external onlyGovernance {
        require(!currentAuction.isActive, "Auction is already active");
        require(
            supportedTokens[tokenIn] && supportedTokens[tokenOut],
            "Unsupported tokens"
        );

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + auctionDuration;

        currentAuction = Auction({
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            collectionPercentage: collectionPercentage
        });

        emit AuctionStarted(
            startTime,
            endTime,
            tokenIn,
            tokenOut,
            collectionPercentage
        );
    }

    function setTokenAuctionPercentage(address token, uint256 percentage)
        external
        onlyAdmin
    {
        require(
            percentage > 0 && percentage <= 100,
            "Percentage must be between 1 and 100"
        );
        require(supportedTokens[token], "Unsupported token");
        tokenAuctionPercentage[token] = percentage;
    }

    mapping(address => uint256) public tokenMaxSupply; // Track max supply for each token

    function setMaxSupply(address token, uint256 maxSupply) external onlyAdmin {
        require(supportedTokens[token], "Token is not supported");
        require(maxSupply > 0, "Max supply must be greater than zero");
        tokenMaxSupply[token] = maxSupply;
    }

    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external notPausedOrStopped {
        require(
            supportedTokens[tokenIn] && supportedTokens[tokenOut],
            "Unsupported tokens"
        );
        require(tokenIn != tokenOut, "Input and output tokens must differ");

        address spender = msg.sender;

        // Check if the caller is approved by the sender for swaps
        if (msg.sender != tx.origin) {
            require(
                approvals[tx.origin][msg.sender],
                "Caller is not approved to swap on behalf of user"
            );
            spender = tx.origin; // Set spender to the original sender
        }

        uint256 amountOut;

        if (
            currentAuction.isActive &&
            block.timestamp <= currentAuction.endTime &&
            tokenIn == currentAuction.tokenIn &&
            tokenOut == currentAuction.tokenOut
        ) {
            uint256 maxSupply = tokenMaxSupply[tokenIn];
            require(maxSupply > 0, "Max supply not set for token");

            // Calculate the max allowed tokenIn for auction based on set percentage
            uint256 maxAllowed = (maxSupply * tokenAuctionPercentage[tokenIn]) /
                100;
            uint256 remainingForAuction = maxAllowed -
                vaults[tokenIn].totalAuctioned;
            require(
                amountIn <= remainingForAuction,
                "Amount exceeds auction limit"
            );

            amountOut = amountIn * 2; // Double the amount of input tokens during auction
        } else {
            amountOut = amountIn; // Regular 1:1 ratio
        }

        Vault storage vaultOut = vaults[tokenOut];
        require(
            vaultOut.totalDeposited >= vaultOut.totalAuctioned + amountOut,
            "Insufficient tokenOut in vault"
        );

        vaultOut.totalAuctioned += amountOut;

        // Update user swap records
        UserSwap storage userSwap = userSwaps[spender];
        userSwap.totalSwapped += amountIn;
        userSwap.tokenSwapped[tokenIn] += amountIn;

        IERC20(tokenIn).transferFrom(spender, address(this), amountIn); // Transfer input tokens from spender to contract
        IERC20(tokenOut).transfer(spender, amountOut); // Transfer output tokens from contract to spender

        emit TokensSwapped(spender, tokenIn, tokenOut, amountIn, amountOut);
    }

    mapping(address => mapping(address => bool)) public approvals;

    // Function to approve another user
    function approveSwap(address approved, bool status) external {
        approvals[msg.sender][approved] = status;
        emit ApprovalForSwap(msg.sender, approved, status);
    }

    // Event for tracking approvals
    event ApprovalForSwap(
        address indexed owner,
        address indexed spender,
        bool status
    );

    function endAuction() external onlyAdmin {
        require(currentAuction.isActive, "No active auction");
        require(
            block.timestamp > currentAuction.endTime,
            "Auction is still active"
        );

        currentAuction.isActive = false;
    }

    function adjustSettings(
        uint256 _auctionInterval,
        uint256 _auctionDuration,
        uint256 _burnPercentage
    ) external onlyAdmin {
        auctionInterval = _auctionInterval;
        auctionDuration = _auctionDuration;
        burnPercentage = _burnPercentage;
    }

    function pauseContract(bool _pause) external onlyAdmin {
        isPaused = _pause;
        emit ContractPaused(_pause);
    }

    function stopContract(bool _stop) external onlyAdmin {
        isStopped = _stop;
        emit ContractStopped(_stop);
    }

    function addSupportedToken(address token) external onlyAdmin {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyAdmin {
        supportedTokens[token] = false;
    }

    function getUserSwappedAmount(address user, address token)
        external
        view
        returns (uint256)
    {
        return userSwaps[user].tokenSwapped[token];
    }
}
