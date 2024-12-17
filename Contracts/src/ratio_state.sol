// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";
import {STATEToken} from "./StateToken.sol";

contract RatioSwapToken is ERC20, Ownable(msg.sender) {
    // Treasuries
    address public davTreasury;
    address public lpTreasury;
    address public devTreasury;

    DAVToken public davToken;
    STATEToken public StateToken;

    // Configurations
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;

    uint256 public lastAuctionTime;
    uint256 public totalBurned;
    uint256 public ratioTarget; // Ratio target for swapping logic

    mapping(address => uint256) public claimableTokens;

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
    event RatioSwappingTypeUpdated(string swapType);
    event TokensMixed(uint256 timestamp);
    event Claimed(address indexed claimant, uint256 amount);

    uint256 public totalBurnedSTATE;

    event AuctionStarted(uint256 startTime, uint256 duration);
    event TokensClaimed(address indexed user, uint256 amount);
    event SwapExecuted(
        address indexed user,
        uint256 stateAmount,
        uint256 listedTokens
    );

    address public BurnAddress = address(0);

    struct Distribution {
        uint256 toDAVHolders;
        uint256 toLiquidity;
        uint256 toDAVTreasury;
        uint256 toDevelopment;
    }

    Distribution public distribution =
        Distribution({
            toDAVHolders: 15,
            toLiquidity: 25,
            toDAVTreasury: 60,
            toDevelopment: 5
        });

    constructor(
        address _davTreasury,
        address _lpTreasury,
        address _devTreasury,
        address _davTokenAddress,
        address _StateTokenAddress,
        uint256 _ratioTarget
    ) ERC20("RatioSwapToken", "RST") {
        davTreasury = _davTreasury;
        lpTreasury = _lpTreasury;
        devTreasury = _devTreasury;
        ratioTarget = _ratioTarget;
        // Use the direct assignment, ensuring _davTokenAddress is of type "address"
        davToken = DAVToken(payable(_davTokenAddress)); // Explicit conversion to "payable"
        StateToken = STATEToken(_StateTokenAddress); // Explicit conversion to "payable"
        lastAuctionTime = block.timestamp;
        _mint(address(this), 100000000000 * 10 ** 18);
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

            // Assign the calculated share to claimable tokens
            if (share > 0) {
                claimableTokens[holder] += share;
            }
        }

        emit TokensDistributedToHolders(distributionAmount, holders.length);
    }

    function swapSTATEForListedTokens(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            StateToken.balanceOf(msg.sender) > 0,
            "statetoken balance must be greater than 0"
        );

        // Transfer STATE tokens from user to the burn address
        StateToken.transferFrom(msg.sender, BurnAddress, _amount);

        // Calculate double listed tokens (2x)
        uint256 listedTokensAmount = _amount * 2;

        // Transfer listed tokens from treasury
        require(
            balanceOf(address(this)) >= listedTokensAmount,
            "Not enough tokens in treasury"
        );
        _transfer(address(this), msg.sender, listedTokensAmount);

        totalBurnedSTATE += _amount;

        emit SwapExecuted(msg.sender, _amount, listedTokensAmount);
    }

    // Swap Logic: Listed Tokens -> STATE Tokens
    function swapListedTokensForSTATE(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer listed tokens from user to treasury
        _transfer(msg.sender, davTreasury, _amount);

        // Calculate double STATE tokens
        uint256 stateTokensAmount = _amount * 2;

        // Transfer STATE tokens to user
        require(
            StateToken.balanceOf(address(this)) >= stateTokensAmount,
            "Not enough STATE tokens"
        );
        StateToken.transfer(msg.sender, stateTokensAmount);

        emit SwapExecuted(msg.sender, stateTokensAmount, _amount);
    }

    function calculateCurrentRatio() public view returns (uint256) {
        uint256 stateTokenSupply = StateToken.totalSupply();
        uint256 listedTokenSupply = totalSupply(); // This contract's token supply

        require(listedTokenSupply > 0, "No listed tokens available");

        return (stateTokenSupply * 1e18) / listedTokenSupply; // Ratio scaled by 1e18
    }

    // Burn STATE Tokens
    function burnSTATE(uint256 _amount) external {
        require(
            StateToken.balanceOf(address(this)) >= _amount,
            "Not enough STATE tokens to burn"
        );

        StateToken.transfer(BurnAddress, _amount);
        totalBurnedSTATE += _amount;

        emit TokensBurned(_amount, msg.sender);
    }

    // ================= Claim Function =================

    function claimTokens() external {
        uint256 amount = claimableTokens[msg.sender];
        require(amount > 0, "No claimable tokens available");

        // Transfer tokens to the claimant
        claimableTokens[msg.sender] = 0;
        _transfer(address(this), msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    // ================= View Functions =================

    function viewClaimableTokens(
        address holder
    ) external view returns (uint256) {
        return claimableTokens[holder];
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

    function getSwapRatioTarget() external view returns (uint256) {
        return ratioTarget;
    }

    function getTotalBurnedTokens() external view returns (uint256) {
        return totalBurned;
    }

    function getBurnedSTATE() external view returns (uint256) {
        return totalBurnedSTATE;
    }
}
