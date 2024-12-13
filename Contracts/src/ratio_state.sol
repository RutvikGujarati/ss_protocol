// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionAndSwap is Ownable(msg.sender) {
    IERC20 public davToken;
    IERC20 public stateToken;

    // Treasuries
    address public davTreasury;
    address public lpTreasury;
    address public devTreasury;

    // Configurations
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;
    uint256 public lastAuctionTime;
    uint256 public ratioTarget;
    uint256 public totalBurned;

    // Percentages (in basis points: 10000 = 100%)
    uint256 public constant PERCENT_DAV_HOLDERS = 1500; // 15%
    uint256 public constant PERCENT_LP_TREASURY = 2500; // 25%
    uint256 public constant PERCENT_DAV_TREASURY = 6000; // 60%
    uint256 public constant PERCENT_DEV_TREASURY = 500; // 5%

    // Events
    event AuctionStarted(uint256 indexed auctionStartTime);
    event TokensSwapped(
        address indexed user,
        uint256 amountIn,
        uint256 amountOut,
        bool reverse
    );
    event TokensBurned(uint256 amount, address indexed burnedBy);

    constructor(
        address _davToken,
        address _stateToken,
        address _davTreasury,
        address _lpTreasury,
        address _devTreasury
    ) {
        davToken = IERC20(_davToken);
        stateToken = IERC20(_stateToken);
        davTreasury = _davTreasury;
        lpTreasury = _lpTreasury;
        devTreasury = _devTreasury;
        lastAuctionTime = block.timestamp;
    }

    // ================= Auction Functions =================

    function startAuction() external onlyOwner {
        require(
            block.timestamp >= lastAuctionTime + auctionInterval,
            "Auction interval not reached"
        );
        lastAuctionTime = block.timestamp;
        emit AuctionStarted(block.timestamp);
    }

    function participateInAuction(uint256 amount) external {
        require(
            block.timestamp <= lastAuctionTime + auctionDuration,
            "Auction has ended"
        );

        stateToken.transferFrom(msg.sender, address(this), amount);

        uint256 doubleAmount = amount * 2;
        require(
            davToken.balanceOf(davTreasury) >= doubleAmount,
            "Insufficient DAV tokens in treasury"
        );

        davToken.transferFrom(davTreasury, msg.sender, doubleAmount);
    }

    // ================= Ratio Swapping Functions =================

    function swapListedForState(uint256 amount) external {
        require(
            stateToken.balanceOf(address(this)) >= amount,
            "Insufficient STATE tokens"
        );

        uint256 doubleAmount = amount * 2;
        stateToken.transferFrom(address(this), msg.sender, doubleAmount);
        davToken.transferFrom(msg.sender, davTreasury, amount);
    }

    function reverseRatioSwap(uint256 amount) external {
        require(
            davToken.balanceOf(davTreasury) >= amount,
            "Insufficient listed tokens"
        );

        uint256 doubleAmount = amount * 2;
        davToken.transferFrom(davTreasury, msg.sender, doubleAmount);
        stateToken.transferFrom(msg.sender, address(this), amount);

        burnTokens(amount);
    }

    // ================= Treasury and Burn Functions =================

    function allocateTokens(uint256 amount) external onlyOwner {
        uint256 toDAVHolders = (amount * PERCENT_DAV_HOLDERS) / 10000;
        uint256 toLPTreasury = (amount * PERCENT_LP_TREASURY) / 10000;
        uint256 toDAVTreasury = (amount * PERCENT_DAV_TREASURY) / 10000;
        uint256 toDevTreasury = (amount * PERCENT_DEV_TREASURY) / 10000;

        // Example distribution to DAV holders
        // Replace this with actual logic to distribute to holders
        davToken.transfer(davTreasury, toDAVHolders);

        davToken.transfer(davTreasury, toDAVTreasury);
        davToken.transfer(lpTreasury, toLPTreasury);
        davToken.transfer(devTreasury, toDevTreasury);
    }

    function burnTokens(uint256 amount) internal {
        totalBurned += amount;
        emit TokensBurned(amount, msg.sender);
    }

    // ================= Admin Functions =================

    function updateAuctionInterval(uint256 interval) external onlyOwner {
        auctionInterval = interval;
    }

    function updateRatioTarget(uint256 target) external onlyOwner {
        ratioTarget = target;
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
