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
    uint256 public constant PERCENT_DAV_TREASURY = 6000; // 60%
    uint256 public constant PERCENT_DEV_TREASURY = 500; // 5%

    // Events
    event AuctionStarted(uint256 indexed auctionStartTime);
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
        address _StateTokenAddress
    ) ERC20("Fluxin", "Fluxin") {
        davToken = DAVToken(payable(_davTokenAddress));
        StateToken = STATEToken(_StateTokenAddress);
        lastAuctionTime = block.timestamp;
        _mint(address(this), 100000000 * 10 ** 18);
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
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

    // ================= Listing Detection and Distribution =================

    function notifyMarketplaceListing() external onlyOwner {
        // Start the distribution
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

    // Swap STATE tokens for Listed Tokens
    function swapSTATEForListedTokens(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

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

    function transferTokens(uint256 amount) public {
        // Ensure the contract has enough balance to transfer
        uint256 contractBalance = balanceOf(address(this));
        require(contractBalance >= amount, "Insufficient balance in contract");

        // Transfer tokens from the contract to the sender (msg.sender)
        bool success = transfer(msg.sender, amount);
        require(success, "Transfer failed");
    }

    function calculateCurrentRatio() public view returns (uint256) {
        uint256 stateTokenSupply = StateToken.totalSupply();
        uint256 listedTokenSupply = totalSupply(); // This contract's token supply

        require(listedTokenSupply > 0, "No listed tokens available");

        return (stateTokenSupply * 1e18) / listedTokenSupply; // Ratio scaled by 1e18
    }

    function burnAndDistributeListedTokens() external {
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
        transfer(msg.sender, amount);

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

        transfer(lpTreasury, toLPTreasury);
        transfer(davTreasury, toDAVTreasury);
        transfer(devTreasury, toDevTreasury);
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
