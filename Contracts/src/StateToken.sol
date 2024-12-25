// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";

contract RatioSwapToken is ERC20, Ownable(msg.sender) {
    DAVToken public davToken;
    uint256 public constant MAX_SUPPLY = 999000000000000 ether;

    // Configurations
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;

    uint256 public lastAuctionTime;
    uint256 public totalBurned;

    mapping(address => uint256) public claimableTokens;

    mapping(address => uint256) public userRewardAmount;

    mapping(address => uint256) public mintedAmount;

    // Events
    event AuctionStarted(uint256 indexed auctionStartTime);
    event AuctionEnded(uint256 indexed auctionEndTime);
    event TokensDistributedToHolders(uint256 amount, uint256 holderCount);
    event TokensBurned(uint256 amount, address indexed burnedBy);
    event TokensBurn(address indexed burner, uint256 amount);

    event ListedOnMarketplace();
    event RatioSwappingTypeUpdated(string swapType);
    event TokensMixed(uint256 timestamp);
    event Claimed(address indexed claimant, uint256 amount);
    event ListedTokensBurn(
        address sender,
        uint256 finalAMount,
        uint256 userAMount
    );

    uint256 public totalBurnedSTATE;
    uint256 public totalListedTokensDeposited;

    event AuctionStarted(uint256 startTime, uint256 duration);
    event TokensClaimed(address indexed user, uint256 amount);
    event SwapExecuted(
        address indexed user,
        uint256 stateAmount,
        uint256 listedTokens
    );

    address public BurnAddress =
        address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            "0x00000000000000000000000000000000000STATE"
                        )
                    )
                )
            )
        );

    address public governanceAddress =
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    // Modifier to check if the sender is the governance address
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    constructor(address _davTokenAddress) ERC20("Fluxin", "Fluxin") {
        davToken = DAVToken(payable(_davTokenAddress));
    }

    // ================= Auction Functions =================

    function startAuction() external onlyGovernance {
        require(
            block.timestamp >= lastAuctionTime + auctionDuration,
            "Auction interval not reached"
        );
        lastAuctionTime = block.timestamp;
        emit AuctionStarted(block.timestamp);
    }

    function checkAndEndAuction() external {
        uint256 auctionEndTime = lastAuctionTime + auctionDuration;
        if (block.timestamp >= auctionEndTime) {
            emit AuctionEnded(block.timestamp);
            lastAuctionTime = 0;
        }
    }

    function isAuctionRunning() external view returns (bool) {
        if (lastAuctionTime == 0) {
            return false; // Auction hasn't started
        }

        uint256 auctionEndTime = lastAuctionTime + auctionDuration;
        return block.timestamp < auctionEndTime; // Returns true if the auction is still running
    }

    function burnAndDistributeListedTokens() external {
        uint256 auctionEndTime = lastAuctionTime + auctionDuration;
        require(block.timestamp >= auctionEndTime, "Auction not ended yet");

        // uint256 burnRatio = getStateBurnRatio(); // Retrieve the burn ratio (scaled by 1e18)

        // Calculate the total burnable amount based on the ratio
        uint256 burnAmount = (totalListedTokensDeposited) / 1e18;

        require(burnAmount > 0, "Burn amount must be greater than zero");
        require(
            totalListedTokensDeposited >= burnAmount,
            "Insufficient tokens to process"
        );

        // Calculate 1% to send back to the user
        uint256 userAmount = (burnAmount * 1) / 100;
        uint256 finalBurnAmount = burnAmount - userAmount;

        // Update total deposited tokens
        totalListedTokensDeposited = 0;

        // Transfer 1% back to the user
        require(
            balanceOf(address(this)) >= userAmount,
            "Insufficient  tokens for user refund"
        );
        _transfer(address(this), msg.sender, userAmount);

        // Burn the remaining 99%
        require(
            balanceOf(address(this)) >= finalBurnAmount,
            "Insufficient  tokens for burn"
        );
        _transfer(address(this), BurnAddress, finalBurnAmount);
        emit ListedTokensBurn(msg.sender, finalBurnAmount, userAmount);
    }

    mapping(address => uint256) public lastDavHolding;

    function getDavRankScaled(address user) public view returns (uint256) {
        uint256 currentDavHolding = davToken.balanceOf(user);

        require(currentDavHolding > 0, "You must hold some DAV tokens");

        uint256 scaledHolding = currentDavHolding / 5000000;

        require(
            scaledHolding <= type(uint256).max / 1,
            "Overflow detected in scaledHolding"
        );

        return scaledHolding;
    }

    function getCalculationOfReward(address user)
        public
        view
        returns (uint256)
    {
        uint256 holdingRank = getDavRankScaled(user);

        require(
            holdingRank > 0,
            "User doesn't have enough rank to receive a reward"
        );

        uint256 totalAmountToDistribute = (MAX_SUPPLY * 200) / 1000;

        require(
            totalAmountToDistribute <= type(uint256).max / 1,
            "Overflow detected in totalAmountToDistribute"
        );

        uint256 userReward = (holdingRank * totalAmountToDistribute) / 1e20;

        require(
            userReward <= totalAmountToDistribute,
            "User reward exceeds distribution limit"
        );

        return userReward;
    }

    function seeMintableAmount() public {
        distributeRewardForUser(msg.sender);
    }

    function distributeRewardForUser(address user) public {
        uint256 currentDavHolding = davToken.balanceOf(user);

        require(
            currentDavHolding > lastDavHolding[user],
            "No additional DAV tokens added"
        );

        uint256 userReward = getCalculationOfReward(user);

        require(userReward > 0, "No reward available for this user");

        userRewardAmount[user] += userReward;

        lastDavHolding[user] = currentDavHolding;
    }

    // Constants
    uint256 public constant REWARD_DECAY_START = 1735064898; // 1735689600; // 01/01/2025 in Unix timestamp
    uint256 public constant DAILY_DECAY_PERCENT = 1; // 1% per day

    // State variables
    mapping(address => uint256) public lastMintTimestamp;

    /**
     * @dev Calculate the current reward after applying decay.
     * @param baseReward The initial reward amount.
     * @param lastRewardMint The last timestamp the reward was minted.
     * @param davMintTimestamp The timestamp of the last DAV mint.
     * @return The adjusted reward amount.
     */
    function getCurrentReward(
        uint256 baseReward,
        uint256 lastRewardMint,
        uint256 davMintTimestamp
    ) internal view returns (uint256) {
        // If before REWARD_DECAY_START, no decay is applied
        if (block.timestamp < REWARD_DECAY_START) {
            return baseReward;
        }

        // Calculate the days since the last reward and DAV minting
        uint256 daysSinceLastReward = (block.timestamp - lastRewardMint) /
            1 days;
        uint256 daysSinceDavMint = (block.timestamp - davMintTimestamp) /
            1 days;

        // Use the effective days (whichever is smaller)
        uint256 effectiveDays = daysSinceLastReward > daysSinceDavMint
            ? daysSinceDavMint
            : daysSinceLastReward;

        // Apply decay for the effective days
        for (uint256 i = 0; i < effectiveDays; i++) {
            baseReward = (baseReward * (100 - DAILY_DECAY_PERCENT)) / 100;
        }

        return baseReward;
    }

    /**
     * @dev Mint the reward for the user, applying decay based on timestamps.
     */
    function mintReward() public {
        uint256 userReward = userRewardAmount[msg.sender];
        require(userReward > 0, "No reward to mint");

        uint256 userDavHoldings = davToken.balanceOf(msg.sender);
        require(userDavHoldings > 0, "User has no DAV holdings");

        uint256 baseContractMint = userDavHoldings * 1e9;

        // Retrieve last DAV mint timestamp
        uint256 davMintTimestamp = davToken.viewLastMintTimeStamp(msg.sender);

        // Use the user's last reward mint timestamp if available
        uint256 userLastMint = lastMintTimestamp[msg.sender] > 0
            ? lastMintTimestamp[msg.sender]
            : block.timestamp;

        // Calculate decayed rewards
        uint256 adjustedUserReward = getCurrentReward(
            userReward,
            userLastMint,
            davMintTimestamp
        );

        // Mint adjusted rewards
        mintedAmount[msg.sender] = adjustedUserReward;
        _mint(msg.sender, adjustedUserReward);
        _mint(address(this), baseContractMint);

        // Reset user reward and update last mint timestamp
        userRewardAmount[msg.sender] = 0;
        lastMintTimestamp[msg.sender] = block.timestamp;
    }

    // ================= View Functions =================

    function viewClaimableTokens(address holder)
        external
        view
        returns (uint256)
    {
        return userRewardAmount[holder];
    }

    // ================= Admin Functions =================

    function updateAuctionInterval(uint256 interval) external onlyGovernance {
        auctionInterval = interval;
    }

    uint256 public numerator;
    uint256 public denominator;

    // Function to set the ratio
    function setRatioTarget(uint256 _numerator, uint256 _denominator)
        external
        onlyGovernance
    {
        require(_denominator > 0, "Denominator cannot be zero");
        numerator = _numerator;
        denominator = _denominator;
    }

    // Function to get the ratio as two values
    function getRatioTarget() external view returns (uint256, uint256) {
        return (numerator, denominator);
    }

    function withdrawTokens(uint256 amount) external onlyGovernance {
        transfer(msg.sender, amount);
    }

    function getTotalBurnedTokens() external view returns (uint256) {
        return totalBurned;
    }

    function getBurnedSTATE() external view returns (uint256) {
        return totalBurnedSTATE;
    }
}
