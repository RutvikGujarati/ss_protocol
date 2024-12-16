// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DAV_Token.sol";

contract RatioSwapToken is ERC20, Ownable(msg.sender) {
    // Treasuries
    address public davTreasury;
    address public lpTreasury;
    address public devTreasury;

    DAVToken public davToken;

    // Configurations
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;
    uint256 public lastAuctionTime;
    uint256 public totalBurned;

    // Percentages (basis points)
    uint256 public constant PERCENT_DAV_HOLDERS = 1500; // 15%
    uint256 public constant PERCENT_LP_TREASURY = 2500; // 25%
    uint256 public constant PERCENT_DAV_TREASURY = 6000; // 60%
    uint256 public constant PERCENT_DEV_TREASURY = 500; // 5%

    // Events
    event AuctionStarted(uint256 indexed auctionStartTime);
    event TokensDistributedToHolders(uint256 amount, uint256 holderCount);
    event TokensBurned(uint256 amount, address indexed burnedBy);
    event ListedOnMarketplace();

    constructor(
        address _davTreasury,
        address _lpTreasury,
        address _devTreasury,
        address _davTokenAddress
    ) ERC20("RatioSwapToken", "RST") {
        davTreasury = _davTreasury;
        lpTreasury = _lpTreasury;
        devTreasury = _devTreasury;

        // Use the direct assignment, ensuring _davTokenAddress is of type "address"
        davToken = DAVToken(payable(_davTokenAddress)); // Explicit conversion to "payable"
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

        _transfer(msg.sender, address(this), amount);
        _mint(msg.sender, amount * 2); // Mint double the amount for auction participants
    }

    // ================= Listing Detection and Distribution =================

    function notifyMarketplaceListing() external onlyOwner {
        // Simulate marketplace listing
        emit ListedOnMarketplace();
        distributeToHolders();
    }

    function distributeToHolders() internal {
        uint256 distributionAmount = (totalSupply() * PERCENT_DAV_HOLDERS) /
            10000;

        // Fetch the total DAV holdings from the treasury
        uint256 totalDAVHoldings = davToken.totalSupply();

        require(totalDAVHoldings > 0, "No DAV token holders detected");

        // Iterate over holders and distribute proportionally
        address[] memory holders = davToken.getDAVHolders(); // Implement this function
        uint256 holderCount = holders.length;

        for (uint256 i = 0; i < holderCount; i++) {
            address holder = holders[i];
            uint256 holderBalance = davToken.balanceOf(holder);

            // Calculate the proportional amount for this holder
            uint256 share = (holderBalance * distributionAmount) /
                totalDAVHoldings;

            // Transfer the calculated share
            if (share > 0) {
                _transfer(address(this), holder, share);
            }
        }

        emit TokensDistributedToHolders(distributionAmount, holderCount);
    }

    // ================= Treasury and Burn Functions =================

    function allocateTokens(uint256 amount) external onlyOwner {
        uint256 toLPTreasury = (amount * PERCENT_LP_TREASURY) / 10000;
        uint256 toDAVTreasury = (amount * PERCENT_DAV_TREASURY) / 10000;
        uint256 toDevTreasury = (amount * PERCENT_DEV_TREASURY) / 10000;

        _transfer(address(this), lpTreasury, toLPTreasury);
        _transfer(address(this), davTreasury, toDAVTreasury);
        _transfer(address(this), devTreasury, toDevTreasury);
    }

    function burnTokens(uint256 amount) external onlyOwner {
        _burn(msg.sender, amount);
        totalBurned += amount;
        emit TokensBurned(amount, msg.sender);
    }

    // ================= Admin Functions =================

    function updateAuctionInterval(uint256 interval) external onlyOwner {
        auctionInterval = interval;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        _transfer(address(this), msg.sender, amount);
    }
}
