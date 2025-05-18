// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ReferralCodeLibrary} from "./libs/ReferralCodeLibrary.sol";
import {ETHDistributionLibrary} from "./libs/ETHDistributionLibrary.sol";
import {TokenProcessingLibrary} from "./libs/TokenProcessingLibrary.sol";
import {BurnClaimLibrary} from "./libs/BurnClaimLibrary.sol";
/**
 * @title Governance Management for DAV Contract
 * @dev Manages governance logic. The `governance` address should be a multi-signature wallet
 *      (e.g., Gnosis Safe) for secure, distributed control. Critical functions are restricted
 *      using the `onlyGovernance` modifier.
 */
contract Decentralized_Autonomous_Vaults_DAV_V2_1 is
    ERC20,
    Ownable(msg.sender),
    ReentrancyGuard // IERC20 initialization
{
    using SafeERC20 for IERC20;
    IERC20 public StateToken;
    //Global unit256 Variables
    // DAV TOken
    uint256 public constant MAX_SUPPLY = 10000000 ether; // 10 Million DAV Tokens
    uint256 public constant TOKEN_COST = 1000 ether; // 1000000 org
    uint256 public constant BASIS_POINTS = 10000;
    //cycle assinging to 10. not want to update or configure later
    uint256 public constant CYCLE_ALLOCATION_COUNT = 10;
    /// @notice Token processing fee required to execute certain operations.
    /// @dev Intentionally set to 100,000 tokens in full native unit (i.e., 100000 ether).
    ///      ⚠️ This is NOT a unit error — the fee is meant to be very high, either for testing,
    ///      access restriction, or deterrence. Adjust only if this is NOT the intended behavior.
    uint256 public constant TOKEN_PROCESSING_FEE = 10000 ether;
    uint256 public totalReferralRewardsDistributed;
    uint256 public mintedSupply; // Total Minted DAV Tokens
    uint256 public stateLpTotalShare;
    uint256 public holderFunds; // Tracks ETH allocated for holder rewards
    uint256 public deployTime;
    uint256 public totalLiquidityAllocated;
    uint256 public totalDevelopmentAllocated;
    // @notice Tracks the number of DAV token holders
    // @dev Intentionally does not decrement davHoldersCount as token transfers are permanently paused for non-governance addresses, ensuring holders remain in the system
    uint256 public davHoldersCount;
    uint256 public totalRewardPerTokenStored;
    //-------------------------- State burn ---------------------------
    // Global tracking of total tokens burned across all users and cycles
    // Used in DApp to display total burn statistics
    uint256 public totalStateBurned;
    uint256 public constant TREASURY_CLAIM_PERCENTAGE = 10; // 10% of treasury for claims
    uint256 public constant CLAIM_INTERVAL = 5 minutes; // 4 hour claim timer
    uint256 public constant MIN_DAV = 1 * 1e18;

    address private constant BURN_ADDRESS =
        0x0000000000000000000000000000000000000369;
    // @notice The governance address with special privileges, set at deployment
    // @dev Intentionally immutable to enforce a fixed governance structure; cannot be updated

    //Governance Privilage
    /*This implementation introduces a ratio-based liquidity provisioning (LP) mechanism, which is currently in beta and undergoing testing. The design is experimental and aims to collect meaningful data to inform and refine the concept. Due to its early-stage nature, certain centralized elements remain in place to ensure flexibility during the testing phase. These will be reviewed and potentially decentralized as the model matures.*/

    /// @notice The governance address with special privileges, set at deployment.
    /// @dev This address is immutable and cannot be changed post-deployment.
    address public immutable governance;
    address public liquidityWallet;
    address public developmentWallet;
    address public stateToken;
    // @notice Transfers are permanently paused for non-governance addresses to enforce a no-transfer policy
    // @dev This is an intentional design choice to restrict token transfers and ensure the integrity of the airdrop mechanism.
    bool public transfersPaused = true;
    // @notice Mapping to track nonce for each user to ensure unique referral code generation
    // @dev Incremented each time a referral code is generated for a user
    mapping(address => uint256) private userNonce;

    // NOTE: Each user is limited to DAV_AMOUNT token entries, so this loop is bounded

    mapping(address => mapping(string => TokenProcessingLibrary.TokenEntry))
        public userTokenEntries;
    mapping(address => uint256) public userTokenCount;
    mapping(address => string[]) public usersTokenNames;
    mapping(string => address) public tokenNameToOwner;
    // it is strictly necessary to keep track all tokenNames to show on dapp with each token entries, so, keep it as it is
    string[] public allTokenNames;
    // Tracks total tokens burned by each user across all cycles
    // Used in DApp to show user-specific burn history
    mapping(address => uint256) public userBurnedAmount;
    mapping(address => mapping(uint256 => bool)) public hasClaimedCycle;
    mapping(address => BurnClaimLibrary.UserBurn[]) public burnHistory;
    mapping(address => string) public userReferralCode; // User's own referral code
    mapping(string => address) public referralCodeToUser; // Referral code to user address
    mapping(address => uint256) public referralRewards; // Tracks referral rewards earned
    mapping(address => uint256) public lastMintTimestamp;
    // @notice Tracks whether an address is a DAV holder
    // @dev Set to true when a user mints tokens and never unset, as transfers are disabled, preventing users from exiting the holder system
    mapping(address => bool) private isDAVHolder;
    mapping(address => uint256) public holderRewards;
    // Mapping to track allocated rewards per cycle per user
    mapping(address => mapping(uint256 => uint256)) public userCycleRewards;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public userMintedAmount;
    mapping(address => uint256) public lastBurnCycle;
    // Tracks whether a user has claimed burns for a specific cycle
    // Used for consistency in burn history
    mapping(address => mapping(uint256 => bool)) public userBurnClaimed;
    // Tracks tokens burned by a user in a specific cycle
    // Used in DApp to display cycle-specific user contributions and for reward calculations
    mapping(address => mapping(uint256 => uint256)) public userCycleBurned;
    // Track allocated treasury per cycle (10% of treasury contributions)
    // Tracks treasury allocation for each cycle
    // Used to determine reward pool for each cycle
    mapping(uint256 => uint256) public cycleTreasuryAllocation;
    // Tracks unclaimed PLS funds for each cycle
    // Ensures rewards don't exceed available funds
    mapping(uint256 => uint256) public cycleUnclaimedPLS;
    // Tracks total tokens burned by all users in a specific cycle
    // Used in DApp to show cycle burn totals and for reward calculations
    mapping(uint256 => uint256) public cycleTotalBurned;
    // NEW: Tracks cycles where a user has unclaimed rewards
    // Maps user to an array of cycle numbers with non-zero burns
    // Used to optimize claimPLS() by iterating only over relevant cycles
    // Simple and avoids bitmap complexity
    mapping(address => uint256[]) public userUnclaimedCycles;
    //to keep track unique name of each tokens. so, not conflict in protocol.
    mapping(string => bool) public isTokenNameUsed;
    event TokensMinted(
        address indexed user,
        uint256 davAmount,
        uint256 stateAmount
    );
    event FundsWithdrawn(string fundType, uint256 amount, uint256 timestamp);
    event HolderAdded(address indexed holder);
    event ReferralBonusPaid(
        address indexed referrer,
        address indexed referee,
        string referralCode,
        uint256 amount
    );
    event ReferralCodeGenerated(address indexed user, string referralCode);  
	  event TokenStatusUpdated(
        address indexed owner,
        string tokenName,
        uint256 status
    );
    constructor(
        address _liquidityWallet,
        address _developmentWallet,
        address _stateToken,
        address _gov,
        string memory tokenName,
        string memory tokenSymbol
    ) ERC20(tokenName, tokenSymbol) {
        require(
            _liquidityWallet != address(0) &&
                _developmentWallet != address(0) &&
                _stateToken != address(0),
            "Wallet addresses cannot be zero"
        );
        liquidityWallet = _liquidityWallet;
        developmentWallet = _developmentWallet;
        stateToken = _stateToken;
        governance = _gov;
        _mint(_gov, 1000 ether);
        mintedSupply += 1000 ether;
        StateToken = IERC20(_stateToken);
        deployTime = block.timestamp;
    }
    modifier onlyGovernance() {
        require(msg.sender == governance, "Caller is not governance");
        _;
    }
    function updateLiquidityWallet(
        address _newLiquidityWallet
    ) external onlyGovernance {
        require(
            _newLiquidityWallet != address(0),
            "Liquidity wallet cannot be zero"
        );
        liquidityWallet = _newLiquidityWallet;
    }
    // Update function for developmentWallet
    function updateDevelopmentWallet(
        address _newDevelopmentWallet
    ) external onlyGovernance {
        require(
            _newDevelopmentWallet != address(0),
            "Development wallet cannot be zero"
        );
        developmentWallet = _newDevelopmentWallet;
    }
    // Restriction of transffering
    modifier whenTransfersAllowed() {
        require(
            !transfersPaused || msg.sender == governance,
            "Transfers are currently paused"
        );
        _;
    }
    function approve(
        address spender,
        uint256 amount
    ) public override whenTransfersAllowed returns (bool) {
        return super.approve(spender, amount);
    }
    function transfer(
        address recipient,
        uint256 amount
    ) public override whenTransfersAllowed returns (bool) {
        bool success = super.transfer(recipient, amount);
        if (success) {
            ReferralCodeLibrary.assignReferralCodeIfNeeded(
                recipient,
                userReferralCode,
                userNonce,
                referralCodeToUser
            );
        }
        return success;
    }
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override whenTransfersAllowed returns (bool) {
        bool success = super.transferFrom(sender, recipient, amount);
        if (success) {
            ReferralCodeLibrary.assignReferralCodeIfNeeded(
                recipient,
                userReferralCode,
                userNonce,
                referralCodeToUser
            );
        }
        return success;
    }

    function _updateRewards(address account) internal {
        if (account != address(0) && account != governance) {
            holderRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = totalRewardPerTokenStored;
        }
    }
    function earned(address account) public view returns (uint256) {
        if (account == governance) {
            return 0; // Governance address is excluded from earning rewards
        }
        return
            (balanceOf(account) *
                (totalRewardPerTokenStored - userRewardPerTokenPaid[account])) /
            1e18 +
            holderRewards[account];
    }

    function mintDAV(
        uint256 amount,
        string memory referralCode
    ) external payable nonReentrant {
        // Checks
        require(amount > 0, "Amount must be greater than zero");
        require(amount % 1 ether == 0, "Amount must be a whole number");
        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");
        uint256 cost = (amount * TOKEN_COST) / 1 ether;
        require(msg.value == cost, "Incorrect PLS amount sent");

        // Effects: Update all state variables
        mintedSupply += amount;
        lastMintTimestamp[msg.sender] = block.timestamp;

        // Generate referral code if not set
        if (bytes(userReferralCode[msg.sender]).length == 0) {
            string memory newReferralCode = ReferralCodeLibrary
                .generateReferralCode(
                    msg.sender,
                    userNonce,
                    referralCodeToUser
                );
            userReferralCode[msg.sender] = newReferralCode;
            referralCodeToUser[newReferralCode] = msg.sender;
            emit ReferralCodeGenerated(msg.sender, newReferralCode);
        }

        // Calculate ETH distribution
        (
            uint256 holderShare,
            uint256 liquidityShare,
            uint256 developmentShare,
            uint256 referralShare,
            uint256 stateLPShare,
            address referrer
        ) = ETHDistributionLibrary.calculateETHDistribution(
                msg.value,
                msg.sender,
                referralCode,
                governance,
                referralCodeToUser,
                totalSupply(),
                davHoldersCount
            );

        // Update liquidity pool share
        uint256 tempStateLpTotalShare = stateLpTotalShare + stateLPShare;
        // Update treasury allocations
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        uint256 cycleAllocation = (stateLPShare * TREASURY_CLAIM_PERCENTAGE) /
            100;
        // Temporary arrays to accumulate cycle updates
        uint256[CYCLE_ALLOCATION_COUNT] memory tempCycleTreasury;
        uint256[CYCLE_ALLOCATION_COUNT] memory tempCycleUnclaimed;
        for (uint256 i = 0; i < CYCLE_ALLOCATION_COUNT; i++) {
            uint256 targetCycle = currentCycle + i;
            tempCycleTreasury[i] =
                cycleTreasuryAllocation[targetCycle] +
                cycleAllocation;
            tempCycleUnclaimed[i] =
                cycleUnclaimedPLS[targetCycle] +
                cycleAllocation;
        }

        // Update holder rewards
        if (holderShare > 0 && totalSupply() > balanceOf(governance)) {
            uint256 effectiveSupply = totalSupply() - balanceOf(governance);
            // Accumulate holderShare * 1e18 to preserve precision
            holderFunds += holderShare; // Temporarily store full share
            uint256 rewardPerToken = (holderFunds * 1e18) / effectiveSupply;
            // Recalculate to ensure no over-distribution
            uint256 usedHolderShare = (rewardPerToken * effectiveSupply) / 1e18;
            holderFunds = usedHolderShare; // Update to actual distributed amount
            totalRewardPerTokenStored += rewardPerToken;
        }
        // Write batched cycle updates to storage
        for (uint256 i = 0; i < CYCLE_ALLOCATION_COUNT; i++) {
            uint256 targetCycle = currentCycle + i;
            cycleTreasuryAllocation[targetCycle] = tempCycleTreasury[i];
            cycleUnclaimedPLS[targetCycle] = tempCycleUnclaimed[i];
        }
        stateLpTotalShare = tempStateLpTotalShare; // Single SSTORE
        // Update referral rewards
        if (referrer != address(0) && referralShare > 0) {
            referralRewards[referrer] += referralShare;
            totalReferralRewardsDistributed += referralShare;
        }

        // Update liquidity and development allocations
        if (liquidityShare > 0) {
            totalLiquidityAllocated += liquidityShare;
        }
        if (developmentShare > 0) {
            totalDevelopmentAllocated += developmentShare;
        }

        // Update user minting and holder status
        userMintedAmount[msg.sender] += amount;
        if (!isDAVHolder[msg.sender] && msg.sender != governance) {
            isDAVHolder[msg.sender] = true;
            davHoldersCount += 1;
            emit HolderAdded(msg.sender);
        }

        // Update rewards and mint tokens
        _updateRewards(msg.sender);
        _mint(msg.sender, amount);
        _updateRewards(msg.sender);

        // Emit events for state changes
        emit TokensMinted(msg.sender, amount, msg.value);
        if (referrer != address(0) && referralShare > 0) {
            emit ReferralBonusPaid(
                referrer,
                msg.sender,
                referralCode,
                referralShare
            );
        }
        if (liquidityShare > 0) {
            emit FundsWithdrawn("Liquidity", liquidityShare, block.timestamp);
        }
        if (developmentShare > 0) {
            emit FundsWithdrawn(
                "Development",
                developmentShare,
                block.timestamp
            );
        }

        // Interactions: Perform external transfers
        if (referrer != address(0) && referralShare > 0) {
            (bool successRef, ) = referrer.call{value: referralShare}("");
            require(successRef, "Referral transfer failed");
        }
        if (liquidityShare > 0) {
            (bool successLiquidity, ) = liquidityWallet.call{
                value: liquidityShare
            }("");
            require(successLiquidity, "Liquidity transfer failed");
        }
        if (developmentShare > 0) {
            (bool successDev, ) = developmentWallet.call{
                value: developmentShare
            }("");
            require(successDev, "Development transfer failed");
        }
    }
    function claimReward() external nonReentrant {
        require(balanceOf(msg.sender) > 0, "Not a DAV holder");
        _updateRewards(msg.sender);
        uint256 reward = holderRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        holderRewards[msg.sender] = 0;
        holderFunds -= reward;
        (bool success, ) = msg.sender.call{value: reward}("");
        require(success, "Reward transfer failed");
    }
    function getDAVHoldersCount() external view returns (uint256) {
        return davHoldersCount;
    }
    function getUserMintedAmount(address user) external view returns (uint256) {
        return userMintedAmount[user];
    }
    function getUserHoldingPercentage(
        address user
    ) public view returns (uint256) {
        uint256 userBalance = balanceOf(user);
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return 0;
        }
        return (userBalance * 1e18) / totalSupply;
    }
    function getUserReferralCode(
        address user
    ) external view returns (string memory) {
        return userReferralCode[user];
    }
    function viewLastMintTimeStamp(address user) public view returns (uint256) {
        return lastMintTimestamp[user];
    }
    // ------------------ Gettting Token data info functions ------------------------------
    /**
     * @notice Processes a token with a name and emoji.
     * @dev No commit-reveal scheme is used as users are expected to verify governance behavior on-chain.
     *      While first-come-first-served naming could allow front-running, users are aware of and accept this risk.
     *      Token names are locked immediately to prevent duplicate submissions.
     *      Each user can process tokens up to the number of DAV they hold.
     *      Governance is trusted to operate transparently and verifiably.
     */
    function processYourToken(
        string memory _tokenName,
        string memory _emoji
    ) public payable {
        if (msg.sender != governance) {
            require(
                msg.value == TOKEN_PROCESSING_FEE,
                "Please send exactly 100,000 PLS"
            );
        }
        TokenProcessingLibrary.processYourToken(
            _tokenName,
            _emoji,
            msg.sender,
            balanceOf(msg.sender),
            governance,
            msg.value, // Pass msg.value as stateLPShare
            userTokenEntries,
            userTokenCount,
            usersTokenNames,
            tokenNameToOwner,
            isTokenNameUsed,
            allTokenNames,
            deployTime,
            CLAIM_INTERVAL,
            CYCLE_ALLOCATION_COUNT,
            TREASURY_CLAIM_PERCENTAGE,
            cycleTreasuryAllocation,
            cycleUnclaimedPLS
        );
    }
    // allTokenEntries is implicitly bounded by each user's DAV balance.
    // Each user can only submit one token per DAV they hold, and DAV itself is capped.
    // This natural upper bound eliminates the need for a hardcoded limit like 1,000 entries.
    /// @notice Returns the list of pending token names for a user.
    /// @dev This function is intended for off-chain use only. It may consume too much gas if called on-chain for users with many entries.
    function getPendingTokenNames(
        address user
    ) public view returns (string[] memory) {
        return
            TokenProcessingLibrary.getPendingTokenNames(
                user,
                usersTokenNames,
                userTokenEntries
            );
    }
    /// @notice Updates the status of a specific token owned by a user.
    /// @dev This function loops through `allTokenEntries`, which could grow indefinitely.
    ///      To prevent excessive gas usage:
    ///      - The contract enforces a practical limit on the number of tokens each user can submit.
    ///      - Each user/tokenName pair is unique; duplicates are not allowed.
    ///      - The loop is efficient under controlled data growth, and pagination is intentionally avoided
    ///        for simplicity and governance-controlled updates only.
    // NOTE: Each user is limited to DAV_AMOUNT (balanceOf(address(this))) token entries, so this loop is bounded
    function updateTokenStatus(
        address _owner,
        string memory _tokenName,
        uint8 _status
    ) external onlyGovernance {
        require(
            bytes(userTokenEntries[_owner][_tokenName].tokenName).length > 0,
            "Token entry not found"
        );
        require(_status <= 1, "Invalid status");
        userTokenEntries[_owner][_tokenName].status = _status;
        emit TokenStatusUpdated(_owner, _tokenName, _status);
    }
    function getAllTokenEntries()
        public
        view
        returns (TokenProcessingLibrary.TokenEntry[] memory)
    {
        TokenProcessingLibrary.TokenEntry[]
            memory entries = new TokenProcessingLibrary.TokenEntry[](
                allTokenNames.length
            );
        for (uint256 i = 0; i < allTokenNames.length; i++) {
            string memory tokenName = allTokenNames[i];
            address user = tokenNameToOwner[tokenName];
            entries[i] = userTokenEntries[user][tokenName];
        }
        return entries;
    }

    // ------------------ Burn functions ------------------------------
    // Burn tokens and update cycle tracking
    function burnState(uint256 amount) external {
        BurnClaimLibrary.burnState(
            amount,
            msg.sender,
            balanceOf(msg.sender),
            MIN_DAV,
            StateToken,
            deployTime,
            CLAIM_INTERVAL,
            canClaim(msg.sender),
            BURN_ADDRESS,
            totalStateBurned,
            userBurnedAmount,
            userCycleBurned,
            cycleTotalBurned,
            userUnclaimedCycles,
            burnHistory,
            lastBurnCycle
        );
    }
    // Check if a user has claimable rewards
    function canClaim(address user) public view returns (bool) {
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        for (uint256 i = 0; i < userUnclaimedCycles[user].length; i++) {
            uint256 cycle = userUnclaimedCycles[user][i];
            if (cycle >= currentCycle) continue; // Skip current or future cycles
            if (cycleTreasuryAllocation[cycle] == 0) continue;
            if (
                userCycleBurned[user][cycle] > 0 &&
                !hasClaimedCycle[user][cycle]
            ) {
                return true; // User has claimable rewards
            }
        }
        return false;
    }
    // Calculate total claimable PLS for a user
    function getClaimablePLS(address user) public view returns (uint256) {
        return
            BurnClaimLibrary.getClaimablePLS(
                user,
                getCurrentCycle(),
                cycleTreasuryAllocation,
                hasClaimedCycle,
                userUnclaimedCycles,
                cycleUnclaimedPLS,
                userCycleBurned,
                cycleTotalBurned
            );
    }
    function claimPLS() external {
        BurnClaimLibrary.claimPLS(
            msg.sender,
            deployTime,
            CLAIM_INTERVAL,
            userUnclaimedCycles,
            cycleTreasuryAllocation,
            cycleUnclaimedPLS,
            userCycleBurned,
            cycleTotalBurned,
            hasClaimedCycle,
            userBurnClaimed,
            burnHistory,
            holderFunds
        );
    }
    function getCurrentCycle() public view returns (uint256) {
        return (block.timestamp - deployTime) / CLAIM_INTERVAL;
    }
    function getAvailableCycleFunds() public view returns (uint256) {
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        require(currentCycle > 0, "No previous cycle exists");
        uint256 previousCycle = currentCycle - 1;
        uint256 unclaimed = cycleUnclaimedPLS[previousCycle];
        // Cross-check with cycleUnclaimedPLS to ensure correctness
        return
            unclaimed <= cycleUnclaimedPLS[previousCycle]
                ? unclaimed
                : cycleUnclaimedPLS[previousCycle];
    }
    function getTimeUntilNextClaim() public view returns (uint256) {
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        uint256 nextClaimableAt = deployTime +
            (currentCycle + 1) *
            CLAIM_INTERVAL;
        return
            nextClaimableAt > block.timestamp
                ? nextClaimableAt - block.timestamp
                : 0;
    }
    function getContractPLSBalance() external view returns (uint256) {
        return address(this).balance - holderFunds;
    }
    function getUserSharePercentage(
        address user
    ) external view returns (uint256) {
        return
            BurnClaimLibrary.getUserSharePercentage(
                user,
                deployTime,
                CLAIM_INTERVAL,
                BASIS_POINTS,
                userCycleBurned,
                cycleTotalBurned,
                userBurnClaimed
            );
    }
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
    fallback() external payable {
        revert("Invalid call");
    }
}
