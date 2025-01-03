// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AuctionRatioSwapping {
    address public admin;
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;
    uint256 public reverseAuctionInterval = 300 days;
    uint256 public tokenAllocationPercentage = 1; // Default to 1% of supply
    uint256 public slippageFeePercentage = 1; // 1% fee

    struct Vault {
        uint256 totalDeposited;
        uint256 totalAuctioned;
    }

    struct Auction {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    mapping(address => Vault) public vaults; // Track vaults for each token
    mapping(address => bool) public supportedTokens; // Track supported tokens
    Auction public currentAuction;

    event TokensDeposited(address indexed token, uint256 amount);
    event TokensRemoved(address indexed token);
    event AuctionStarted(uint256 startTime, uint256 endTime);
    event TokensSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addToken(address token) external onlyAdmin {
        require(!supportedTokens[token], "Token already supported");
        supportedTokens[token] = true;
    }

    function removeToken(address token) external onlyAdmin {
        require(supportedTokens[token], "Token not supported");
        delete supportedTokens[token];
        delete vaults[token];
        emit TokensRemoved(token);
    }

    function depositTokens(address token, uint256 amount) external onlyAdmin {
        require(supportedTokens[token], "Unsupported token");

        Vault storage vault = vaults[token];
        vault.totalDeposited += amount;

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit TokensDeposited(token, amount);
    }

    function startAuction() external onlyAdmin {
        require(!currentAuction.isActive, "Auction is already active");

        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + auctionDuration;

        currentAuction = Auction({
            startTime: startTime,
            endTime: endTime,
            isActive: true
        });

        emit AuctionStarted(startTime, endTime);
    }

    function swapTokens(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external {
        require(currentAuction.isActive, "No active auction");
        require(block.timestamp <= currentAuction.endTime, "Auction has ended");
        require(supportedTokens[tokenIn], "Unsupported input token");
        require(supportedTokens[tokenOut], "Unsupported output token");
        require(tokenIn != tokenOut, "Input and output tokens must differ");

        //@need to fix - approval issue is here

        Vault storage vaultOut = vaults[tokenOut];
        uint256 allocation = (vaultOut.totalDeposited *
            tokenAllocationPercentage) / 100;
        uint256 amountOut = (amountIn * allocation) /
            (vaultOut.totalAuctioned + 1); // Avoid division by zero

        vaultOut.totalAuctioned += amountOut;

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transferFrom(address(this), msg.sender, amountOut);

        emit TokensSwapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

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
        uint256 _reverseAuctionInterval,
        uint256 _tokenAllocationPercentage,
        uint256 _slippageFeePercentage
    ) external onlyAdmin {
        auctionInterval = _auctionInterval;
        auctionDuration = _auctionDuration;
        reverseAuctionInterval = _reverseAuctionInterval;
        tokenAllocationPercentage = _tokenAllocationPercentage;
        slippageFeePercentage = _slippageFeePercentage;
    }
}
