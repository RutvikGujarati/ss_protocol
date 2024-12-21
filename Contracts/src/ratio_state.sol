// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";
import {STATEToken} from "./StateToken.sol";

contract RatioSwapToken is ERC20, Ownable(msg.sender) {
    // Treasuries
    address public davTreasury = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;
    address public lpTreasury = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;
    address public devTreasury = 0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;

    DAVToken public davToken;
    STATEToken public StateToken;

    // Configurations
    uint256 public auctionInterval = 50 days;
    uint256 public auctionDuration = 24 hours;

    uint256 public lastAuctionTime;
    uint256 public totalBurned;

    mapping(address => uint256) public claimableTokens;

    // Percentages (basis points)
    uint256 public constant PERCENT_DAV_HOLDERS = 1500; // 15%
    uint256 public constant PERCENT_LP_TREASURY = 2500; // 25%
    uint256 public constant PERCENT_DAV_TREASURY = 5500; // 55%
    uint256 public constant PERCENT_DEV_TREASURY = 500; // 5%

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
        0x3Bdbb84B90aBAf52814aAB54B9622408F2dCA483;

    // Modifier to check if the sender is the governance address
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }
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
        address _davTokenAddress,
        string memory name,
        string memory symbol,
        address _StateTokenAddress
    ) ERC20(name, symbol) {
        davToken = DAVToken(payable(_davTokenAddress));
        StateToken = STATEToken(_StateTokenAddress);
        // lastAuctionTime = block.timestamp;
        _mint(address(this), 100000000 * 10**18);
    }

    // ================= Auction Functions =================

    function startAuction() external onlyGovernance {
        require(
            block.timestamp >= lastAuctionTime + auctionDuration,
            "Auction interval not reached"
        );
        lastAuctionTime = block.timestamp;
        distributeToHolders();
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

    // ================= Listing Detection and Distribution =================

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

    // Swap STATE tokens for Listed Tokens
    function swapSTATEForListedTokens(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        // Ensure auction is active before swapping
        uint256 auctionEndTime = lastAuctionTime + auctionDuration;
        require(block.timestamp < auctionEndTime, "Auction has ended");

        StateToken.transferFrom(msg.sender, BurnAddress, _amount);

        // Calculate double listed tokens (2x)
        uint256 listedTokensAmount = _amount * 2;

        require(
            balanceOf(address(this)) >= listedTokensAmount,
            "Not enough tokens in treasury"
        );
        // Transfer listed tokens from treasury
        _transfer(address(this), msg.sender, listedTokensAmount);

        totalBurnedSTATE += _amount;

        emit SwapExecuted(msg.sender, _amount, listedTokensAmount);
    }

    // Swap Logic: Listed Tokens -> STATE Tokens
    function swapListedTokensForSTATE(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        _transfer(msg.sender, davTreasury, _amount);

        uint256 stateTokensAmount = _amount * 2;

        totalListedTokensDeposited += _amount;

        // Ensure enough STATE tokens are available in the contract
        require(
            StateToken.balanceOf(address(this)) >= stateTokensAmount,
            "Not enough STATE tokens"
        );

        // Transfer STATE tokens to user
        StateToken.transfer(msg.sender, stateTokensAmount);

        emit SwapExecuted(msg.sender, stateTokensAmount, _amount);
    }

    function burnAndDistributeListedTokens() external {
        uint256 auctionEndTime = lastAuctionTime + auctionDuration;
        require(block.timestamp >= auctionEndTime, "Auction not ended yet");

        uint256 burnRatio = getStateBurnRatio(); // Retrieve the burn ratio (scaled by 1e18)

        // Calculate the total burnable amount based on the ratio
        uint256 burnAmount = (totalListedTokensDeposited * burnRatio) / 1e18;

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

    function viewClaimableTokens(address holder)
        external
        view
        returns (uint256)
    {
        return claimableTokens[holder];
    }

    // ================= Treasury and Burn Functions =================

    function allocateTokens() external onlyGovernance {
        uint256 amount = balanceOf(address(this));
        require(amount > 0, "No tokens available for allocation");
        require(
            PERCENT_LP_TREASURY + PERCENT_DAV_TREASURY + PERCENT_DEV_TREASURY ==
                9000,
            "Percentage allocation mismatch"
        );

        uint256 toLPTreasury = (amount * PERCENT_LP_TREASURY) / 10000;
        uint256 toDAVTreasury = (amount * PERCENT_DAV_TREASURY) / 10000;
        uint256 toDevTreasury = (amount * PERCENT_DEV_TREASURY) / 10000;

        require(
            toLPTreasury + toDAVTreasury + toDevTreasury <= amount,
            "Allocation exceeds total balance"
        );

        _transfer(address(this), lpTreasury, toLPTreasury);
        _transfer(address(this), davTreasury, toDAVTreasury);
        _transfer(address(this), devTreasury, toDevTreasury);
    }

    function WithdrawLPTokens() external onlyGovernance {
        uint256 amount = balanceOf(address(this));
        require(amount > 0, "No tokens available for withdrawal");
        require(PERCENT_LP_TREASURY > 0, "LP treasury percentage is not set");

        uint256 toLPTreasury = (amount * PERCENT_LP_TREASURY) / 10000;
        require(toLPTreasury <= amount, "Withdrawal exceeds total balance");

        _transfer(address(this), msg.sender, toLPTreasury);
    }

    function WithdrawDAVTreasuryTokens() external onlyGovernance {
        uint256 amount = balanceOf(address(this));
        require(amount > 0, "No tokens available for withdrawal");
        require(PERCENT_DAV_TREASURY > 0, "DAV treasury percentage is not set");

        uint256 toDAVTreasury = (amount * PERCENT_DAV_TREASURY) / 10000;
        require(toDAVTreasury <= amount, "Withdrawal exceeds total balance");

        _transfer(address(this), msg.sender, toDAVTreasury);
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

    function getStateBurnRatio() public view returns (uint256) {
        uint256 totalSupply = StateToken.totalSupply();
        require(totalSupply > 0, "Total supply must be greater than zero");

        return (totalBurnedSTATE * 1e18) / totalSupply;
    }

    function calculateBurnAmount() external view returns (uint256) {
        uint256 burnRatio = getStateBurnRatio();

        uint256 burnAmount = (totalListedTokensDeposited * burnRatio) / 1e18;

        return burnAmount;
    }
}
