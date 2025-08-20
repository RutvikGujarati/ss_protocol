// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./libraries/ReferralCodeLib.sol";
import "./libraries/TimeUtilsLib.sol";
import "./libraries/Distribution.sol";
import "./libraries/TokenRegistryLib.sol";
import "./libraries/BurnLibrary.sol";

contract DAV_V2_2 is
    ERC20,
    Ownable(msg.sender),
    ReentrancyGuard // IERC20 initialization
{
    //NOTE: some Functions uses loops to get values which can be gas-intensive, but necessary for accurate, real-time calculation of active token balances.
    //NOTE: This contract is intended for EVM based chains.
    //NOTE: High ether costs are added for some required chains which has low token values like pulsechain. 1 pls ~ 0.00000396 ETH.
    using SafeERC20 for IERC20;
    using TimeUtilsLib for uint256;
    using ReferralCodeLib for ReferralCodeLib.ReferralData;
    using Distribution for Distribution.HolderState;
    using TokenRegistryLib for TokenRegistryLib.TokenRegistry;
    using BurnLibrary for BurnLibrary.BurnAndClaimState;
    BurnLibrary.BurnAndClaimState internal BurnAndClaimState;
    TokenRegistryLib.TokenRegistry internal registry;
    Distribution.HolderState internal holderState;

    IERC20 public StateToken;
    ReferralCodeLib.ReferralData private referralData;
    //Global unit256 Variables
    // DAV TOken
    // NOTE: // This contract is intended for PulseChain, not Ethereum.
    uint256 public constant MAX_SUPPLY = 1000000000 ether; // 1 billion DAV Tokens
    uint256 public constant MAX_HOLDERS = 15000;
    uint256 public constant TOKEN_COST = 500 ether; // 1500000 org
    uint256 public constant REFERRAL_BONUS = 5; // 5% bonus for referrers
    uint256 public constant LIQUIDITY_SHARE = 80; // 80% LIQUIDITY SHARE
    uint256 public constant DEVELOPMENT_SHARE = 5; // 5% DEV SHARE
    uint256 public constant HOLDER_SHARE = 10; // 10% HOLDER SHARE
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant INITIAL_GOV_MINT = 2000 ether;
    uint256 public constant MAX_TOKEN_PER_USER = 100;
    uint256 public constant DAV_TOKEN_EXPIRE = 2 hours; // 30 days for mainnet

    //cycle assinging to 10. not want to update or configure later
    uint256 public constant CYCLE_ALLOCATION_COUNT = 10;
    /// @notice Token processing fee required to execute certain operations.
    /// @dev Intentionally set to 100000 tokens in full native unit (i.e., 100000 ether).
    ///      ⚠️ This is NOT a unit error — the fee is meant to be very high, either for testing,
    ///      access restriction, or deterrence. Adjust only if this is NOT the intended behavior.
    // This contract is intended for PulseChain, not Ethereum.
    // Please note that the value of PLS is significantly lower compared to ETH,
    uint256 public constant TOKEN_PROCESSING_FEE = 1000 ether;
    uint256 public constant TOKEN_WITHIMAGE_PROCESS = 1500 ether;
    uint256 public totalReferralRewardsDistributed;
    uint256 public mintedSupply; // Total Minted DAV Tokens
    uint256 public claimStartTime;
    uint256 public totalLiquidityAllocated;
    uint256 public totalDevelopmentAllocated;
    //-------------------------- State burn ---------------------------
    uint256 public constant TREASURY_CLAIM_PERCENTAGE = 10; // 10% of treasury for claims
    uint256 public constant CLAIM_INTERVAL = 1 days; // 10 days claim timer
    uint256 public constant MIN_DAV = 50 * 1e18;
    uint256 public constant PRECISION = 1e18;
    address private constant BURN_ADDRESS =
        0x0000000000000000000000000000000000000369;
    // @notice The governance address with special privileges, set at deployment
    // @dev Intentionally immutable to enforce a fixed governance structure; cannot be updated
    //Governance Privilage
    /*This implementation introduces a ratio-based liquidity provisioning (LP) mechanism, which is currently in beta and undergoing testing. 
	The design is experimental and aims to collect meaningful data to inform and refine the concept. Due to its early-stage nature, certain centralized elements remain in place to ensure flexibility during the testing phase. 
	These will be reviewed and potentially decentralized as the model matures.*/

    //NOTE: Governance is using multi-sig method to ensure security of that wallet address.
    address public governance;
    address public liquidityWallet;
    address public developmentWallet;
    // @notice Transfers are permanently paused for non-governance addresses to enforce a no-transfer policy
    // @dev This is an intentional design choice to restrict token transfers and ensure the integrity of the airdrop mechanism.
    bool public transfersPaused = true;
    bool public paused = false;

    // @notice Mapping to track nonce for each user to ensure unique referral code generation
    // @dev Incremented each time a referral code is generated for a user
    mapping(address => uint256) private userNonce;
    struct UserBurn {
        uint256 amount;
        uint256 totalAtTime;
        uint256 timestamp;
        uint256 cycleNumber; // Tracks which 1-hour cycle this burn belongs to
        uint256 userShare; // User's share percentage at burn time (scaled by 1e18)
        bool claimed; // Tracks if this burn's reward has been claimed
    }
    struct GovernanceProposal {
        address newGovernance;
        uint256 proposedAt;
    }
    GovernanceProposal public pendingGovernance;

    mapping(address => uint256) public referralRewards; // Tracks referral rewards earned
    struct MintBatch {
        uint256 amount;
        uint256 timestamp; // mint time
        bool fromGovernance; // true = disqualified from rewards
    }
    struct WalletUpdateProposal {
        address newWallet;
        uint256 proposedAt;
    }

    WalletUpdateProposal public pendingLiquidityWallet;
    WalletUpdateProposal public pendingDevelopmentWallet;

    mapping(address => MintBatch[]) public mintBatches;

    event RewardsClaimed(address indexed user, uint256 amount);
    event ReferralCodeGenerated(address indexed user, string referralCode);
    event TokenNameAdded(address indexed user, string name);
    event GovernanceUpdated(address oldGovernance, address newGovernance);
    event LiquidityWalletUpdated(address newWallet);
    event DevelopmentWalletUpdated(address newWallet);
    event ContractPaused(address by);
    event ContractUnpaused(address by);
    event TokenStatusUpdated(
        address indexed owner,
        string tokenName,
        TokenRegistryLib.TokenStatus status
    );
    event DistributionEvent(
        address indexed user,
        uint256 amountMinted,
        uint256 amountPaid,
        address indexed referrer,
        uint256 referralShare,
        uint256 liquidityShare,
        uint256 developmentShare,
        uint256 holderShare,
        uint256 timestamp
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
        governance = _gov;
        _mint(_gov, INITIAL_GOV_MINT);
        mintedSupply += INITIAL_GOV_MINT;
        StateToken = IERC20(_stateToken);
        claimStartTime = TimeUtilsLib.calculateNextClaimStartGMT(
            block.timestamp
        );
    }

    modifier onlyGovernance() {
        require(msg.sender == governance, "Caller is not governance");
        _;
    }
    // Step 1: Propose a new governance with timelock
    function proposeGovernance(address newGovernance) external onlyGovernance {
        require(newGovernance != address(0), "Invalid governance address");
        pendingGovernance = GovernanceProposal(
            newGovernance,
            block.timestamp + 7 days
        );
    }

    // Step 2: Confirm governance after timelock expires
    function confirmGovernance() external onlyGovernance {
        require(
            pendingGovernance.newGovernance != address(0),
            "No pending proposal"
        );
        require(
            block.timestamp >= pendingGovernance.proposedAt,
            "Timelock not expired"
        );

        address oldGovernance = governance;
        governance = pendingGovernance.newGovernance;

        // Clear pending
        delete pendingGovernance;

        emit GovernanceUpdated(oldGovernance, governance);
    }
    function proposeLiquidityWallet(
        address _newLiquidityWallet
    ) external onlyGovernance {
        require(_newLiquidityWallet != address(0), "Invalid wallet address");
        pendingLiquidityWallet = WalletUpdateProposal(
            _newLiquidityWallet,
            block.timestamp + 7 days
        );
    }

    function confirmLiquidityWallet() external onlyGovernance {
        require(
            pendingLiquidityWallet.newWallet != address(0),
            "No pending proposal"
        );
        require(
            block.timestamp >= pendingLiquidityWallet.proposedAt,
            "Timelock not expired"
        );
        liquidityWallet = pendingLiquidityWallet.newWallet;
        delete pendingLiquidityWallet;
        emit LiquidityWalletUpdated(liquidityWallet);
    }
    function proposeDevelopmentWallet(
        address _newDevelopmentWallet
    ) external onlyGovernance {
        require(_newDevelopmentWallet != address(0), "Invalid wallet address");
        pendingDevelopmentWallet = WalletUpdateProposal(
            _newDevelopmentWallet,
            block.timestamp + 7 days
        );
    }

    function confirmDevelopmentWallet() external onlyGovernance {
        require(
            pendingDevelopmentWallet.newWallet != address(0),
            "No pending proposal"
        );
        require(
            block.timestamp >= pendingDevelopmentWallet.proposedAt,
            "Timelock not expired"
        );
        developmentWallet = pendingDevelopmentWallet.newWallet;
        delete pendingDevelopmentWallet;
        emit DevelopmentWalletUpdated(developmentWallet);
    }
    // Restriction of transffering
    modifier whenTransfersAllowed() {
        require(
            !transfersPaused || msg.sender == governance,
            "Transfers are currently paused"
        );
        _;
    }
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    function pause() external onlyGovernance {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyGovernance {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }
    // - Restricts approval unless transfers are allowed or the caller is governance
    function approve(
        address spender,
        uint256 amount
    ) public override whenTransfersAllowed returns (bool) {
        if (msg.sender != governance) {
            revert("Transfers not allowed");
        }
        return super.approve(spender, amount);
    }
    function transfer(
        address recipient,
        uint256 amount
    ) public override whenTransfersAllowed returns (bool) {
        bool success = super.transfer(recipient, amount);
        if (success) {
            referralData.assignReferralCodeIfNeeded(recipient); // safe, only if no code
            mintBatches[recipient].push(
                MintBatch({
                    amount: amount,
                    timestamp: block.timestamp,
                    fromGovernance: true
                })
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
            referralData.assignReferralCodeIfNeeded(recipient); // safe, only if no code
            mintBatches[recipient].push(
                MintBatch({
                    amount: amount,
                    timestamp: block.timestamp,
                    fromGovernance: true
                })
            );
        }
        return success;
    } // assign reffer to direct sended user

    function earned(address account) public view returns (uint256) {
        return holderState._earned(account, governance);
    }

    /// @notice Mints DAV tokens and distributes ETH to stakeholders.
    /// @param amount Tokens to mint (in wei).
    /// @param referralCode Optional referrer code for rewards.
    function mintDAV(
        uint256 amount,
        string memory referralCode
    ) external payable nonReentrant whenNotPaused {
        // Checks
        require(amount > 0, "Amount must be greater than zero");
        require(getDAVHoldersCount() < MAX_HOLDERS, "Max holders reached");
        require(msg.sender != governance, "Governance cannot mint");
        require(amount % 1 ether == 0, "Amount must be a whole number");
        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");
        uint256 cost = (amount * TOKEN_COST) / 1 ether;
        require(msg.value == cost, "Incorrect PLS amount sent");
        // Update holder  before distributing

        // Calculate distribution
        (
            uint256 holderShare,
            uint256 liquidityShare,
            uint256 developmentShare,
            uint256 referralShare,
            uint256 stateLPShare,
            address referrer
        ) = Distribution.calculateETHDistribution(
                msg.value,
                msg.sender,
                referralCode,
                governance,
                HOLDER_SHARE,
                LIQUIDITY_SHARE,
                DEVELOPMENT_SHARE,
                REFERRAL_BONUS,
                holderState.davHoldersCount,
                getTotalActiveSupply(),
                referralData.referralCodeToUser
            );

        // Effects
        mintedSupply += amount;
        mintBatches[msg.sender].push(
            MintBatch({
                amount: amount,
                timestamp: block.timestamp,
                fromGovernance: false
            })
        );
        // Generate referral code if not already set
        if (bytes(referralData.userReferralCode[msg.sender]).length == 0) {
            string memory newReferralCode = referralData.generateReferralCode(
                msg.sender
            );
            referralData.userReferralCode[msg.sender] = newReferralCode;
            emit ReferralCodeGenerated(msg.sender, newReferralCode);
        }

        // Handle cycle allocations
        uint256 currentCycle = getCurrentClaimCycle();
        holderState.distributeCycleAllocations(
            stateLPShare,
            currentCycle,
            TREASURY_CLAIM_PERCENTAGE,
            CYCLE_ALLOCATION_COUNT
        );
        // Mint tokens
        _mint(msg.sender, amount);
        holderState.updateHolderStatus(
            msg.sender,
            governance,
            getActiveBalance
        );
        // Distribute holder rewards
        holderState.distributeHolderShare(
            holderShare,
            governance,
            getActiveMintedBalance
        );
        // Interactions
        if (referrer != address(0) && referralShare > 0) {
            require(
                address(referrer).code.length == 0,
                "Referrer is a contract"
            );
            referralRewards[referrer] += referralShare;
            totalReferralRewardsDistributed += referralShare;
            (bool successRef, ) = referrer.call{value: referralShare}("");
            require(successRef, "Referral transfer failed");
        }

        if (liquidityShare > 0) {
            require(
                address(liquidityWallet).code.length == 0,
                "Liquidity wallet is a contract"
            );
            totalLiquidityAllocated += liquidityShare;
            (bool successLiquidity, ) = liquidityWallet.call{
                value: liquidityShare
            }("");
            require(successLiquidity, "Liquidity transfer failed");
        }
        if (developmentShare > 0) {
            require(
                address(developmentWallet).code.length == 0,
                "development Wallet is a contract"
            );
            totalDevelopmentAllocated += developmentShare;
            (bool successDev, ) = developmentWallet.call{
                value: developmentShare
            }("");
            require(successDev, "Development transfer failed");
        }
        emit DistributionEvent(
            msg.sender,
            amount,
            msg.value,
            referrer,
            referralShare,
            liquidityShare,
            developmentShare,
            holderShare,
            block.timestamp
        );
    }
    //NOTE: This function is used to get the active balance of a user, which includes all minted tokens that have not expired.
    // Below three functions used in DApp to show user balances, active tokens, and other related information.
    // it will take some gas to iterate over all mint batches for a user, but it is necessary to ensure accurate balance calculations.
    function getActiveBalance(address user) public view returns (uint256) {
        // Governance tokens do not expire
        MintBatch[] storage batches = mintBatches[user];
        uint256 active = 0;
        for (uint256 i = 0; i < batches.length; i++) {
            if (block.timestamp <= batches[i].timestamp + DAV_TOKEN_EXPIRE) {
                active += batches[i].amount;
            }
        }
        return active;
    }
    function getMintBatches(
        address user
    )
        public
        view
        returns (uint256[] memory amounts, uint256[] memory timestamps)
    {
        MintBatch[] storage batches = mintBatches[user];
        uint256 len = batches.length;
        amounts = new uint256[](len);
        timestamps = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            amounts[i] = batches[i].amount;
            timestamps[i] = batches[i].timestamp;
        }
        return (amounts, timestamps);
    }
    function getExpireTime() public pure returns (uint256) {
        return DAV_TOKEN_EXPIRE;
    }

    function getActiveMintedBalance(
        address account
    ) public view returns (uint256) {
        MintBatch[] storage batches = mintBatches[account];
        uint256 active = 0;

        for (uint256 i = 0; i < batches.length; i++) {
            if (
                !batches[i].fromGovernance &&
                block.timestamp <= batches[i].timestamp + DAV_TOKEN_EXPIRE
            ) {
                active += batches[i].amount;
            }
        }

        return active;
    }
    // ℹ️ Note on Token Expiration Tracking:
    // We intentionally retain all mint batches, including expired ones,
    // to allow users to view their complete mint and expiration history.
    // This historical data is essential for transparency and user experience,
    // enabling interfaces to display past mint events, expirations, and timing.
    // ⚠️ While this increases on-chain storage and logic complexity,
    // we consider it necessary and do not perform batch cleanup or pruning.
    /**
     * @notice Tracks each user's mint batches and expiration timestamps.
     * @dev Expired batches are preserved to support full history visibility for users.
     */
    function getMintTimestamps(
        address user
    )
        external
        view
        returns (
            uint256[] memory mintTimes,
            uint256[] memory expireTimes,
            uint256[] memory amounts,
            bool[] memory fromGovernance,
            bool[] memory isExpired
        )
    {
        MintBatch[] storage batches = mintBatches[user];
        uint256 len = batches.length;

        mintTimes = new uint256[](len);
        expireTimes = new uint256[](len);
        amounts = new uint256[](len);
        fromGovernance = new bool[](len);
        isExpired = new bool[](len);

        for (uint256 i = 0; i < len; i++) {
            uint256 mintTime = batches[i].timestamp;
            uint256 expireTime = mintTime + DAV_TOKEN_EXPIRE;

            mintTimes[i] = mintTime;
            expireTimes[i] = expireTime;
            amounts[i] = batches[i].amount;
            fromGovernance[i] = batches[i].fromGovernance;
            isExpired[i] = block.timestamp > expireTime;
        }

        return (mintTimes, expireTimes, amounts, fromGovernance, isExpired);
    }

    function getTotalActiveSupply() public view returns (uint256) {
        /*  Iterate over all DAV holders to calculate the total active supply.This loop is gas-intensive but necessary for accurate, real-time calculation of active token balances. which constrains the array size and keeps gas costs manageable for the expected user base. We avoid complex optimizations like caching or snapshots to maintain clear, straightforward logic, accepting the gas cost as a trade-off for simplicity and transparency. */
        uint256 holdersLength = holderState._holderLength();
        uint256 total = 0;
        for (uint256 i = 0; i < holdersLength; i++) {
            total += getActiveBalance(holderState.davHolders[i]);
        }
        return total;
    }

    function getExpiredTokenCount(address user) public view returns (uint256) {
        // Governance tokens do not expire
        if (user == governance) {
            return 0;
        }
        uint256 expired = 0;
        MintBatch[] storage batches = mintBatches[user];
        for (uint256 i = 0; i < batches.length; i++) {
            if (block.timestamp > batches[i].timestamp + DAV_TOKEN_EXPIRE) {
                expired += batches[i].amount;
            }
        }
        return expired;
    }

    function claimReward() external payable nonReentrant whenNotPaused {
        address user = msg.sender;
        require(user != address(0), "Invalid user");
        require(msg.sender != governance, "Not eligible to claim rewards");
        // Update holder status to check for expiration
        holderState.updateHolderStatus(
            msg.sender,
            governance,
            getActiveBalance
        ); // Calculate claimable reward
        uint256 reward = earned(msg.sender);
        require(reward > 0, "No rewards to claim");
        require(holderState.holderFunds >= reward, "Insufficient holder funds");
        // Update state
        holderState.holderRewards[msg.sender] = 0;
        holderState.holderFunds -= reward;
        // Transfer reward
        (bool success, ) = user.call{value: reward, gas: 30000}("");
        require(success, "Reward transfer failed");
        emit RewardsClaimed(msg.sender, reward);
    }

    function getDAVHoldersCount() public view returns (uint256) {
        return holderState.davHoldersCount;
    }

    function getUserReferralCode(
        address user
    ) external view returns (string memory) {
        return referralData.userReferralCode[user];
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
        string memory _emojiOrImage
    ) external payable nonReentrant{
        bool isImage = registry.addTokenEntry(
            msg.sender,
            _tokenName,
            _emojiOrImage,
            64, // maxNameLength
            1 // maxEmojiLength
        );

        uint256 userTokenBalance = getActiveBalance(msg.sender);
        uint256 tokensSubmitted = registry.userTokenCount[msg.sender];

        if (msg.sender != governance) {
            uint256 requiredFee = getTokenProcessingFee(isImage);
            require(
                userTokenBalance > tokensSubmitted,
                "Need more DAV to process"
            );
            require(msg.value == requiredFee, "Incorrect fee");

            uint256 stateLPShare = msg.value;
            holderState.distributeCycleAllocations(
                stateLPShare,
                getCurrentClaimCycle(),
                TREASURY_CLAIM_PERCENTAGE,
                CYCLE_ALLOCATION_COUNT
            );
        }

        emit TokenNameAdded(msg.sender, _tokenName);
    }

    function getTokenProcessingFee(bool isImage) public pure returns (uint256) {
        return isImage ? TOKEN_WITHIMAGE_PROCESS : TOKEN_PROCESSING_FEE;
    }

    // allTokenEntries is implicitly bounded by each user's DAV balance.
    // Each user can only submit one token per DAV they hold, and DAV itself is capped.
    // This natural upper bound eliminates the need for a hardcoded limit like 1,000 entries.
    /// @notice Returns the list of pending token names for a user.
    /// @dev This function is intended for off-chain use only. It may consume too much gas if called on-chain for users with many entries.
    function getPendingTokenNames(
        address user
    ) public view returns (string[] memory) {
        return registry.getPendingTokenNames(user, MAX_TOKEN_PER_USER);
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
        TokenRegistryLib.TokenStatus _status
    ) external onlyGovernance nonReentrant{
        registry.updateTokenStatus(_owner, _tokenName, _status);
        emit TokenStatusUpdated(_owner, _tokenName, _status);
    }

    function getAllTokenEntries()
        public
        view
        returns (TokenRegistryLib.TokenEntry[] memory)
    {
        return registry.getAllTokenEntries();
    }
    // ------------------ Burn functions ------------------------------
    // Burn tokens and update cycle tracking
    /// @notice Burns StateToken and logs user contribution for a cycle
    /// @param amount Amount of StateToken to burn
    function burnState(uint256 amount) external whenNotPaused nonReentrant {
        BurnAndClaimState.burnState(
            msg.sender,
            amount,
            StateToken,
            governance,
            MIN_DAV,
            claimStartTime,
            CLAIM_INTERVAL,
            BURN_ADDRESS,
            getActiveBalance,
            holderState.cycleTreasuryAllocation
        );
    }
    function getUserBurnedAmount(address user) external view returns (uint256) {
        return BurnAndClaimState.userBurnedAmount[user];
    }

    // Check if a user has claimable rewards
    function canClaim(address user) external view returns (bool) {
        return
            BurnAndClaimState.canClaim(
                user,
                claimStartTime,
                CLAIM_INTERVAL,
                holderState.cycleTreasuryAllocation
            );
    }
    // Calculate total claimable PLS for a user
    function getClaimablePLS(address user) external view returns (uint256) {
        return
            BurnAndClaimState.getClaimablePLS(
                user,
                claimStartTime,
                CLAIM_INTERVAL,
                holderState.cycleTreasuryAllocation,
                holderState.cycleUnclaimedPLS
            );
    }
    function getContractPLSBalance() public view returns (uint256) {
        return address(this).balance - holderState.holderFunds;
    }
    /// @notice Claims PLS rewards for a user across eligible cycles
    /// @dev Iterates over userUnclaimedCycles to calculate and distribute rewards
    /// @dev Requires that the claim period has started (current cycle > 0).
    /// @dev Reverts if there are no rewards to claim or if the contract balance is insufficient.
    /// @custom:security non-reentrant and used pagination of 10 previous cycle

    function claimPLS() external whenNotPaused nonReentrant{
        BurnAndClaimState.claimPLS(
            msg.sender,
            claimStartTime,
            CLAIM_INTERVAL,
            holderState.holderFunds,
            getContractPLSBalance(),
            holderState.cycleTreasuryAllocation,
            holderState.cycleUnclaimedPLS
        );
    }
    function getCurrentClaimCycle() public view returns (uint256) {
        return (block.timestamp - claimStartTime) / CLAIM_INTERVAL;
    }

    function getAvailableCycleFunds() public view returns (uint256) {
        uint256 currentCycle = getCurrentClaimCycle();
        require(currentCycle > 0, "No previous cycle exists");
        uint256 previousCycle = currentCycle - 1;
        uint256 unclaimed = holderState.cycleUnclaimedPLS[previousCycle];
        // Cross-check with cycleUnclaimedPLS to ensure correctness
        return
            unclaimed <= holderState.cycleUnclaimedPLS[previousCycle]
                ? unclaimed
                : holderState.cycleUnclaimedPLS[previousCycle];
    }
    function getTimeUntilNextClaim() public view returns (uint256) {
        if (block.timestamp < claimStartTime + CLAIM_INTERVAL) {
            return (claimStartTime + CLAIM_INTERVAL) - block.timestamp;
        }

        uint256 currentCycle = getCurrentClaimCycle();
        uint256 nextClaimableAt = claimStartTime +
            (currentCycle + 1) *
            CLAIM_INTERVAL;
        return
            nextClaimableAt > block.timestamp
                ? nextClaimableAt - block.timestamp
                : 0;
    }
    function hasClaimingStarted() public view returns (bool) {
        return block.timestamp >= claimStartTime;
    }

    function getUserSharePercentage(
        address user
    ) external view returns (uint256) {
        return
            BurnAndClaimState.getUserSharePercentage(
                user,
                claimStartTime,
                CLAIM_INTERVAL,
                BASIS_POINTS
            );
    }
    function cycleTotalBurned(uint256 cycle) public view returns (uint256) {
        return BurnAndClaimState.cycleTotalBurned[cycle];
    }
    function totalStateBurned() view public returns (uint256) {
        return BurnAndClaimState.totalStateBurned;
    }

    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
    fallback() external payable {
        revert("Invalid call");
    }
}
