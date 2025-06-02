// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

//NOTE: Not required for library use
//NOTE: Mainnet deployment - To add a token = 10 Million PLS
//NOTE Mainet deployments - Mint 1 DAV = 1 Million PLS
//NOTE: Mainet deployment - 1 DAV required to add a token
//NOTE: Mainnet deployment - 10 DAV required to become a market maker
contract DAV_V2_2 is
    ERC20,
    Ownable(msg.sender),
    ReentrancyGuard // IERC20 initialization
{
    using SafeERC20 for IERC20;
    IERC20 public StateToken;
    //Global unit256 Variables
    // DAV TOken
    uint256 public constant MAX_SUPPLY = 10000000 ether; // 10 Million DAV Tokens
    uint256 public constant MAX_USER = 10000;
    uint256 public constant TOKEN_COST = 1000 ether; // 1000000 org
    uint256 public constant REFERRAL_BONUS = 5; // 5% bonus for referrers
    uint256 public constant LIQUIDITY_SHARE = 30; // 30% LIQUIDITY SHARE
    uint256 public constant DEVELOPMENT_SHARE = 5; // 5% DEV SHARE
    uint256 public constant HOLDER_SHARE = 10; // 10% HOLDER SHARE
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant INITIAL_GOV_MINT = 1000 ether;
    //cycle assinging to 10. not want to update or configure later
    uint256 public constant CYCLE_ALLOCATION_COUNT = 10;
    /// @notice Token processing fee required to execute certain operations.
    /// @dev Intentionally set to 100,000 tokens in full native unit (i.e., 100000 ether).
    ///      ⚠️ This is NOT a unit error — the fee is meant to be very high, either for testing,
    ///      access restriction, or deterrence. Adjust only if this is NOT the intended behavior.

    uint256 public constant TOKEN_PROCESSING_FEE = 2000 ether;
    uint256 public constant TOKEN_WITHIMAGE_PROCESS = 2500 ether;
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
    uint256 public constant CLAIM_INTERVAL = 1 days; // 4 days claim timer
    uint256 public constant MIN_DAV = 10 * 1e18;
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
    address public stateToken;
    // @notice Transfers are permanently paused for non-governance addresses to enforce a no-transfer policy
    // @dev This is an intentional design choice to restrict token transfers and ensure the integrity of the airdrop mechanism.
    bool public transfersPaused = true;
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
    enum TokenStatus {
        Pending,
        Processed
    }
    /**
     * 🔒 Front-Running Protection Design:
     * - Token names are tracked *per user*, not globally.
     * - A user’s token name cannot be stolen or overwritten by others.
     * - This prevents front-running without needing a commit-reveal scheme.
     * - Even if another user submits the same token name, it is independent and scoped to them.
     * - Users do not lose their processing fees due to front-running.
     */
    struct TokenEntry {
        address user;
        string tokenName;
        string emoji; // 🆕 Add this field
        TokenStatus status;
    }
    // NOTE: Each user is limited to DAV_AMOUNT token entries, so this loop is bounded
    mapping(address => mapping(string => TokenEntry)) public userTokenEntries;
    mapping(address => uint256) public userTokenCount;
    mapping(address => string[]) public usersTokenNames;
    mapping(string => address) public tokenNameToOwner;
    mapping(address => bool) public receivedFromGovernance;
    // it is strictly necessary to keep track all tokenNames to show on dapp with each token entries, so, keep it as it is
    string[] public allTokenNames;
    // Tracks total tokens burned by each user across all cycles
    // Used in DApp to show user-specific burn history
    mapping(address => uint256) public userBurnedAmount;
    mapping(address => mapping(uint256 => bool)) public hasClaimedCycle;
    mapping(address => UserBurn[]) public burnHistory;
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
    event TokensBurned(address indexed user, uint256 amount, uint256 cycle);
    event RewardClaimed(address indexed user, uint256 amount, uint256 cycle);
    event RewardsClaimed(address indexed user, uint256 amount);
    event HolderAdded(address indexed holder);
    event ReferralCodeGenerated(address indexed user, string referralCode);
    event TokenNameAdded(address indexed user, string name);
    event TokenStatusUpdated(
        address indexed owner,
        string tokenName,
        TokenStatus status
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
        stateToken = _stateToken;
        governance = _gov;
        _mint(_gov, INITIAL_GOV_MINT);
        mintedSupply += INITIAL_GOV_MINT;
        StateToken = IERC20(_stateToken);
        deployTime = block.timestamp;
    }
    modifier onlyGovernance() {
        require(msg.sender == governance, "Caller is not governance");
        _;
    }
    /**
     * @notice Transfers protocol governance to a new address.
     * @dev This function is critical to the protocol's upgradeability and fund routing logic.
     * While the current system operates under centralized governance,
     * this role is essential for managing key operations such as:
     * - Approving new tokens
     * - Updating treasury wallets
     * - Adjusting economic parameters
     * - Handling emergency actions
     * 🔐 (future upgrade):
     * Migrate to a multi-signature (multi-sig) governance system (e.g. Gnosis Safe)
     * combined with a time-lock mechanism to:
     * - Require multiple trusted parties to approve governance actions
     * - Provide transparency and time for community review before critical changes
     */
    function transferGovernance(address newGovernance) external onlyGovernance {
        require(newGovernance != address(0), "Invalid governance address");
        governance = newGovernance;
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
            _assignReferralCodeIfNeeded(recipient); // safe, only if no code
            receivedFromGovernance[recipient] = true;
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
            _assignReferralCodeIfNeeded(recipient); // safe, only if no code
            receivedFromGovernance[recipient] = true;
        }
        return success;
    } // assign reffer to direct sended user
    function _assignReferralCodeIfNeeded(address user) internal {
        if (bytes(userReferralCode[user]).length == 0) {
            string memory code = _generateReferralCode(user);
            userReferralCode[user] = code;
            emit ReferralCodeGenerated(user, code);
        }
    }
    function _updateRewards(address account) internal {
        if (account != address(0) && account != governance) {
            holderRewards[account] = earned(account);
            userRewardPerTokenPaid[account] = totalRewardPerTokenStored;
        }
    }
    function earned(address account) public view returns (uint256) {
        if (account == governance || receivedFromGovernance[account]) {
            return 0; // address is excluded from earning rewards
        }
        return
            (balanceOf(account) *
                (totalRewardPerTokenStored - userRewardPerTokenPaid[account])) /
            1e18 +
            holderRewards[account];
    }
    /**
     * @notice Generates a unique referral code for a given user
     * @dev Uses internal entropy and a nonce to prevent collisions
     * @param user The address of the user for whom the code is generated
     * @return code A unique 8-character alphanumeric referral code
     */
    //The library is not required here to generate referral code
    function _generateReferralCode(
        address user
    ) internal returns (string memory code) {
        userNonce[user]++;
        uint256 maxAttempts = 10;
        for (uint256 i = 0; i < maxAttempts; i++) {
            bytes32 hash = keccak256(
                abi.encodePacked(user, userNonce[user], i)
            );
            code = _toAlphanumericString(hash, 8);
            if (referralCodeToUser[code] == address(0)) {
                referralCodeToUser[code] = user;
                return code;
            }
        }
        revert("Unable to generate unique referral code");
    }
    function _toAlphanumericString(
        bytes32 hash,
        uint256 length
    ) internal pure returns (string memory) {
        bytes
            memory charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            // Use each byte in the hash to pick a character from the charset
            result[i] = charset[uint8(hash[i]) % charset.length];
        }
        return string(result);
    }
    /// @notice Distributes ETH contributions across holders, liquidity, development, and referrals
    /// @param value Amount of ETH to distribute
    /// @param sender Sender of the ETH
    /// @param referralCode Optional referral code for bonus allocation

    function _calculateETHDistribution(
        uint256 value,
        address sender,
        string memory referralCode
    )
        internal
        view
        returns (
            uint256 holderShare,
            uint256 liquidityShare,
            uint256 developmentShare,
            uint256 referralShare,
            uint256 stateLPShare,
            address referrer
        )
    {
        // Explicitly exclude governance address from receiving holder share
        bool excludeHolderShare = sender == governance ||
            receivedFromGovernance[sender];
        require(
            !excludeHolderShare || sender != address(0),
            "Invalid governance address"
        );
        // Set holder share to 0 for governance address
        holderShare = excludeHolderShare ? 0 : (value * HOLDER_SHARE) / 100;
        liquidityShare = (value * LIQUIDITY_SHARE) / 100;
        developmentShare = (value * DEVELOPMENT_SHARE) / 100;
        referralShare = 0;
        referrer = address(0);
        if (bytes(referralCode).length > 0) {
            address _referrer = referralCodeToUser[referralCode];
            if (_referrer != address(0) && _referrer != sender) {
                referralShare = (value * REFERRAL_BONUS) / 100;
                referrer = _referrer;
            }
        } // If no holders or total supply is 0, redirect holder share to liquidity
        if (davHoldersCount == 0 || totalSupply() == 0) {
            liquidityShare += holderShare;
            holderShare = 0;
        } // Ensure total distribution does not exceed value
        uint256 distributed = holderShare +
            liquidityShare +
            developmentShare +
            referralShare;
        require(distributed <= value, "Over-allocation");
        stateLPShare = value - distributed;
    }
    function mintDAV(
        uint256 amount,
        string memory referralCode
    ) external payable nonReentrant {
        //     ----------------------------    CHECKS   ----------------------------           //
        require(amount > 0, "Amount must be greater than zero");
        require(amount % 1 ether == 0, "Amount must be a whole number");
        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");
        require(davHoldersCount < MAX_USER, "Max number of users reached");
        uint256 cost = (amount * TOKEN_COST) / 1 ether;
        require(msg.value == cost, "Incorrect PLS amount sent");
        //     -------------------------- CALCULATE DISTRIBUTIONS ---------------------------  //
        (
            uint256 holderShare,
            uint256 liquidityShare,
            uint256 developmentShare,
            uint256 referralShare,
            uint256 stateLPShare,
            address referrer
        ) = _calculateETHDistribution(msg.value, msg.sender, referralCode);
        // Prepare values before state changes
        // Calculate current reward cycle based on fixed interval since deploy
        // NOTE: block.timestamp can be manipulated slightly by miners (±15s),
        // but this has negligible impact on cycle logic since CLAIM_INTERVAL spans multiple days (e.g., 4 days).
        // Therefore, any minor timestamp drift will not affect fairness or accuracy.
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        uint256 totalCycleAllocation = (stateLPShare *
            TREASURY_CLAIM_PERCENTAGE) / 100;
        //     ----------------------------    EFFECTS   ----------------------------           //
        // Mint tracking and referral code logic
        mintedSupply += amount;
        userMintedAmount[msg.sender] += amount;
        lastMintTimestamp[msg.sender] = block.timestamp;
        if (bytes(userReferralCode[msg.sender]).length == 0) {
            string memory newReferralCode = _generateReferralCode(msg.sender);
            userReferralCode[msg.sender] = newReferralCode;
            referralCodeToUser[newReferralCode] = msg.sender;
            emit ReferralCodeGenerated(msg.sender, newReferralCode);
        }
        // Update cycle treasury allocations
        for (uint256 i = 0; i < CYCLE_ALLOCATION_COUNT; i++) {
            uint256 targetCycle = currentCycle + i;
            cycleTreasuryAllocation[targetCycle] += totalCycleAllocation;
            cycleUnclaimedPLS[targetCycle] += totalCycleAllocation;
        }
        // Update holder rewards if needed
        uint256 newHolderFunds = holderFunds;
        uint256 newTotalRewardPerTokenStored = totalRewardPerTokenStored;
        if (holderShare > 0 && totalSupply() > balanceOf(governance)) {
            // Ensure effectiveSupply is not zero to avoid division by zero
            require(effectiveSupply > 0, "Effective supply cannot be zero");
            // Calculate rewardPerToken in 1e18 precision
            uint256 rewardPerToken = (holderShare * 1e18) / effectiveSupply;
            // Now reverse-calculate usedHolderShare in same precision
            uint256 usedHolderShare = (rewardPerToken * effectiveSupply) / 1e18;
            // Additional safety check
            require(
                usedHolderShare <= holderShare,
                "Used share exceeds holder share"
            );
            newHolderFunds += usedHolderShare;
            newTotalRewardPerTokenStored += rewardPerToken;
        }
        holderFunds = newHolderFunds;
        totalRewardPerTokenStored = newTotalRewardPerTokenStored;
        stateLpTotalShare += stateLPShare;
        // Update user holder status
        if (!isDAVHolder[msg.sender] && msg.sender != governance) {
            isDAVHolder[msg.sender] = true;
            davHoldersCount += 1;
            emit HolderAdded(msg.sender);
        }
        _updateRewards(msg.sender);
        _mint(msg.sender, amount);
        _updateRewards(msg.sender);
        //     ----------------------------    INTERACTIONS   ----------------------------           //
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
        // Referral reward transfer
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
        // Liquidity share transfer
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
        // Development share transfer
        if (developmentShare > 0) {
            require(
                address(developmentWallet).code.length == 0,
                "Development wallet is a contract"
            );
            totalDevelopmentAllocated += developmentShare;
            (bool successDev, ) = developmentWallet.call{
                value: developmentShare
            }("");
            require(successDev, "Development transfer failed");
        }
    }

    function claimReward() external nonReentrant {
        uint256 userBalance = balanceOf(msg.sender);
        require(userBalance > 0, "Not a DAV holder");
        require(
            msg.sender != governance && !receivedFromGovernance[msg.sender],
            "Not eligible to claim rewards"
        );
        _updateRewards(msg.sender);
        uint256 reward = holderRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        // --- Effects: Update state BEFORE external call ---
        holderRewards[msg.sender] = 0;
        holderFunds -= reward;
        // --- Interactions: External call after state changes ---
        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Reward transfer failed");
        // Note: `payable` added for clarity, though not strictly required if msg.sender is address
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
        string memory _emojiOrImage
    ) public payable {
        // Basic input checks
        require(_isValidTokenName(_tokenName), "Invalid token name format");
        require(bytes(_tokenName).length > 0, "Please provide tokenName");
        require(bytes(_emojiOrImage).length <= 10000, "input too long");
        // Token name must not already be globally used
        require(!isTokenNameUsed[_tokenName], "Token name already used");
        // Token name must not already be submitted by the user
        require(
            userTokenEntries[msg.sender][_tokenName].user == address(0),
            "Token name already used by user"
        );
        // Determine whether the input is an image (IPFS link or emoji string)
        bool isImage = _isImageURL(_emojiOrImage);
        // If not an image, restrict emoji string to max 10 UTF-8 characters
        if (!isImage) {
            require(
                _utfStringLength(_emojiOrImage) <= 10,
                "Max 10 UTF-8 characters allowed"
            );
        }
        // Ensure user has DAV balance left to submit another token
        uint256 userTokenBalance = balanceOf(msg.sender);
        uint256 tokensSubmitted = userTokenCount[msg.sender];
        require(
            userTokenBalance > tokensSubmitted,
            "You need more DAV to process new token"
        );
        // Require fee only if user is not governance
        if (msg.sender != governance) {
            uint256 requiredFee = isImage
                ? TOKEN_WITHIMAGE_PROCESS
                : TOKEN_PROCESSING_FEE;
            require(
                msg.value == requiredFee,
                isImage
                    ? "Please send exact image fee"
                    : "Please send exactly 100,000 PLS"
            );
            // Allocate fee across future cycles for rewards
            uint256 stateLPShare = msg.value;
            uint256 currentCycle = (block.timestamp - deployTime) /
                CLAIM_INTERVAL;
            uint256 cycleAllocation = (stateLPShare *
                TREASURY_CLAIM_PERCENTAGE) / 100;
            for (uint256 i = 0; i < CYCLE_ALLOCATION_COUNT; i++) {
                uint256 targetCycle = currentCycle + i;
                cycleTreasuryAllocation[targetCycle] += cycleAllocation;
                cycleUnclaimedPLS[targetCycle] += cycleAllocation;
            }
        }
        // -------------------
        // ⚠️ FRONT-RUNNING RISK ACKNOWLEDGED
        // -------------------
        // We acknowledge that this function is susceptible to MEV front-running, where a miner or
        // bot could observe a pending transaction and submit the same `_tokenName` with higher gas.
        // ➤ We currently do NOT use a commit-reveal scheme or on-chain randomness.
        // ➤ We accept this trade-off because token names are public and not highly valuable assets.
        // ➤ We mitigate economic loss by:
        //   - Rejecting duplicate token names immediately.
        //   - Not allowing re-submission of already-claimed names.
        //   - Requiring exact fees to prevent accidental overpayment in front-run attacks.
        // ➤ This is similar to ENS name registrations pre-commitment model; future updates may include a commit-reveal phase.
        // ➤ Users are encouraged to submit important token names during low gas periods or through private RPCs.
        // This design is a known compromise between UX and perfect MEV resistance.
        // Track submitted token name
        usersTokenNames[msg.sender].push(_tokenName);
        tokenNameToOwner[_tokenName] = msg.sender;
        isTokenNameUsed[_tokenName] = true;
        userTokenCount[msg.sender]++;
        // Track token in global list and user entry map
        allTokenNames.push(_tokenName);
        userTokenEntries[msg.sender][_tokenName] = TokenEntry(
            msg.sender,
            _tokenName,
            _emojiOrImage,
            TokenStatus.Pending
        );
        emit TokenNameAdded(msg.sender, _tokenName);
    }
    function _isValidTokenName(
        string memory name
    ) internal pure returns (bool) {
        bytes memory b = bytes(name);
        if (b.length < 3 || b.length > 32) return false; // min/max length
        for (uint256 i; i < b.length; i++) {
            bytes1 char = b[i];
            // Only allow alphanumerics, hyphens, underscores (optional)
            if (
                !(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A) && // a-z
                !(char == 0x2D || char == 0x5F) // - or _
            ) {
                return false;
            }
        }
        return true;
    }
    function _contains(
        string memory str,
        string memory substr
    ) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);
        if (substrBytes.length == 0 || substrBytes.length > strBytes.length)
            return false;
        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool matchFound = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    matchFound = false;
                    break;
                }
            }
            if (matchFound) return true;
        }
        return false;
    }

    function _isImageURL(string memory str) internal pure returns (bool) {
        return _contains(str, "mypinata.cloud/ipfs/");
    }

    /// @notice Counts the number of UTF-8 characters in a string
    /// @dev Each emoji can be 1–4 bytes. This counts actual characters, not bytes.
    function _utfStringLength(
        string memory str
    ) internal pure returns (uint256 length) {
        uint256 i = 0;
        bytes memory strBytes = bytes(str);
        while (i < strBytes.length) {
            uint8 b = uint8(strBytes[i]);
            if (b >> 7 == 0) {
                i += 1;
            } else if (b >> 5 == 0x6) {
                if (i + 1 >= strBytes.length) break; // skip incomplete sequence
                i += 2;
            } else if (b >> 4 == 0xE) {
                if (i + 2 >= strBytes.length) break;
                i += 3;
            } else if (b >> 3 == 0x1E) {
                if (i + 3 >= strBytes.length) break;
                i += 4;
            } else {
                // Skip invalid byte instead of reverting
                i += 1;
                continue;
            }
            length++;
        }
    }
    // allTokenEntries are implicitly limited by the user's DAV token balance.
    // A user can only submit one token per DAV they own, and since the total DAV supply is capped,
    // this naturally restricts the number of entries per user.
    // Therefore, we do not need pagination or arbitrary hard limits like 1,000 entries.
    /// @notice Returns the list of pending token names for a given user.
    /// @dev This function is meant for off-chain access only.
    /// Calling this on-chain may be expensive for users with many entries,
    /// but due to the natural upper bound explained above, pagination is not required.
    function getPendingTokenNames(
        address user
    ) public view returns (string[] memory) {
        string[] memory all = usersTokenNames[user];
        //require the limt with 100 pending token names will be fetched. - it is needed
        uint256 limit = all.length > 100 ? 100 : all.length; // hardcoded limit
        string[] memory temp = new string[](limit);
        uint256 count = 0;
        for (uint256 i = 0; i < limit; i++) {
            if (userTokenEntries[user][all[i]].status == TokenStatus.Pending) {
                temp[count] = all[i];
                count++;
            }
        }
        string[] memory result = new string[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = temp[j];
        }
        return result;
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
        TokenStatus _status
    ) external onlyGovernance {
        require(
            bytes(userTokenEntries[_owner][_tokenName].tokenName).length > 0,
            "Token entry not found"
        );
        userTokenEntries[_owner][_tokenName].status = _status;
        emit TokenStatusUpdated(_owner, _tokenName, _status);
    }
    //require to fetch all entries not perticular from start to end (not with pagination - it stops at some amount of limits)
    function getTokenEntries(
        uint256 start,
        uint256 limit
    ) internal view returns (TokenEntry[] memory) {
        uint256 end = start + limit > allTokenNames.length
            ? allTokenNames.length
            : start + limit;
        TokenEntry[] memory entries = new TokenEntry[](end - start);
        for (uint256 i = start; i < end; i++) {
            string memory tokenName = allTokenNames[i];
            address user = tokenNameToOwner[tokenName];
            entries[i - start] = userTokenEntries[user][tokenName];
        }
        return entries;
    }

    function getAllTokenEntries() public view returns (TokenEntry[] memory) {
        return getTokenEntries(0, allTokenNames.length);
    }
    // ------------------ Burn functions ------------------------------
    // Burn tokens and update cycle tracking
    /// @notice Burns StateToken and logs user contribution for a cycle
    /// @param amount Amount of StateToken to burn
    function burnState(uint256 amount) external {
        require(balanceOf(msg.sender) >= MIN_DAV, "Need at least 10 DAV");
        require(
            StateToken.balanceOf(msg.sender) >= amount,
            "Insufficient StateToken balance"
        );
        require(amount > 0, "Burn amount must be > 0");
        require(
            StateToken.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        // 🔒 Claim-before-burn rule ensures clean separation of claimable rewards across cycles
        require(
            !canClaim(msg.sender),
            "Must claim previous rewards before burning"
        );
        // ⚠️ CRITICAL: Transfer must succeed before mutating any protocol state.
        // Prevents partial state mutation if user lacks funds or allowance.
        StateToken.safeTransferFrom(msg.sender, BURN_ADDRESS, amount);
        // ✅ All following state changes are assumed safe since they use mappings or arrays:
        // - Mappings never revert on non-existent keys.
        // - No external or nested calls after this point.
        // 🔢 Burn tracking state updates
        totalStateBurned += amount;
        userBurnedAmount[msg.sender] += amount;
        userCycleBurned[msg.sender][currentCycle] += amount;
        cycleTotalBurned[currentCycle] += amount;
        // 💡 Snapshot user share at time of burn using 1e18 precision
        uint256 userShare = (userCycleBurned[msg.sender][currentCycle] * 1e18) /
            cycleTotalBurned[currentCycle];
        // ⚙️ Ensure current cycle is recorded for later claiming
        bool cycleExists = false;
        uint256[] storage userCycles = userUnclaimedCycles[msg.sender];
        for (uint256 i = 0; i < userCycles.length; i++) {
            if (userCycles[i] == currentCycle) {
                cycleExists = true;
                break;
            }
        }
        if (!cycleExists) {
            userCycles.push(currentCycle);
        }
        // 🧾 Record full burn entry for analytics and UI
        burnHistory[msg.sender].push(
            UserBurn({
                amount: amount,
                totalAtTime: cycleTotalBurned[currentCycle],
                timestamp: block.timestamp,
                cycleNumber: currentCycle,
                userShare: userShare,
                claimed: false
            })
        );
        // 🕒 Update last burn tracker
        lastBurnCycle[msg.sender] = currentCycle;
        emit TokensBurned(msg.sender, amount, currentCycle);
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
        uint256 currentCycle = getCurrentCycle();
        uint256 totalClaimable = 0;
        // Iterate over user's unclaimed cycles
        for (uint256 i = 0; i < userUnclaimedCycles[user].length; i++) {
            uint256 cycle = userUnclaimedCycles[user][i];
            if (
                cycle >= currentCycle ||
                cycleTreasuryAllocation[cycle] == 0 ||
                hasClaimedCycle[user][cycle]
            ) {
                continue;
            }
            uint256 userBurn = userCycleBurned[user][cycle];
            uint256 totalBurn = cycleTotalBurned[cycle];
            if (userBurn == 0 || totalBurn == 0) continue;
            // Calculate reward in real-time
            cycleReward =
                (cycleTreasuryAllocation[cycle] * userBurn) /
                totalBurn;

            // Cap reward by available funds
            uint256 availableFunds = cycleUnclaimedPLS[cycle];
            if (cycleReward > availableFunds) {
                cycleReward = availableFunds;
            }
            totalClaimable += cycleReward;
        }
        return totalClaimable;
    }
    /// @notice Claims PLS rewards for a user across eligible cycles
    /// @dev Iterates over userUnclaimedCycles to calculate and distribute rewards
    /// required to iterate through all users unclaimed cycle that way user can't loose their funds so, no use of cycle arrays
    /**
     * @notice Claim PLS rewards across all unclaimed burn cycles.
     * @dev ⚠️ HIGH RISK: This function iterates over userUnclaimedCycles, which can grow unbounded.
     * but, this structure require as user will left so many cycle as unclaimed to iterating with all cycle is needed to send allocated user funds when they call this function
     * For now, this loop should be used with caution and assumed safe only for low to moderate cycle counts.
     */
    function claimPLS() external {
        address user = msg.sender;
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        require(currentCycle > 0, "Claim period not started");
        uint256 totalReward = 0;
        uint256 unclaimedLength = userUnclaimedCycles[user].length;
        uint256 keepCount = 0;
        uint256[] memory newUnclaimed = new uint256[](unclaimedLength); // Pre-allocate memory to avoid resizing cost
        // PROCESS UNCLAIMED CYCLES
        // This loop processes each cycle the user hasn't claimed from.
        // The number of entries in userUnclaimedCycles[user] is controlled at burn time,
        // and grows linearly per cycle — NOT per interaction — and is expected to stay within gas-safe bounds.
        for (uint256 i = 0; i < unclaimedLength; i++) {
            uint256 cycle = userUnclaimedCycles[user][i];
            // Skip invalid or future cycles
            if (
                cycle >= currentCycle ||
                cycleTreasuryAllocation[cycle] == 0 ||
                hasClaimedCycle[user][cycle]
            ) {
                newUnclaimed[keepCount++] = cycle;
                continue;
            }
            // Check burn validity
            uint256 userBurn = userCycleBurned[user][cycle];
            uint256 totalBurn = cycleTotalBurned[cycle];
            if (userBurn == 0 || totalBurn == 0) {
                newUnclaimed[keepCount++] = cycle;
                continue;
            } // Calculate reward
            uint256 reward = (cycleTreasuryAllocation[cycle] * userBurn) /
                totalBurn;
            // Skip if insufficient funds left in treasury
            if (cycleUnclaimedPLS[cycle] < reward) {
                newUnclaimed[keepCount++] = cycle;
                continue;
            }
            // Apply reward and update state
            cycleUnclaimedPLS[cycle] -= reward;
            totalReward += reward;
            hasClaimedCycle[user][cycle] = true;
            userBurnClaimed[user][cycle] = true;
        } // UPDATE BURN HISTORY
        // This loop marks any relevant historical burns as claimed.
        // burnHistory[user] is only appended to when the user burns,
        // so this loop also remains bounded to user activity, not total system state.
        for (uint256 j = 0; j < burnHistory[user].length; j++) {
            if (
                !burnHistory[user][j].claimed &&
                hasClaimedCycle[user][burnHistory[user][j].cycleNumber]
            ) {
                burnHistory[user][j].claimed = true;
            }
        }
        // SHRINK THE UNCLAIMED CYCLE ARRAY
        // We remove processed cycles and retain future/unclaimable ones
        if (keepCount < unclaimedLength) {
            assembly {
                mstore(newUnclaimed, keepCount) // Resize the memory array in-place
            }
            userUnclaimedCycles[user] = newUnclaimed;
        }
        // FINAL REWARD TRANSFER
        require(totalReward > 0, "Nothing to claim");
        require(
            (address(this).balance - holderFunds) >= totalReward,
            "Insufficient contract balance"
        );
        (bool success, ) = payable(user).call{value: totalReward}("");
        require(success, "PLS transfer failed");
        emit RewardClaimed(user, totalReward, currentCycle);
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
        uint256 currentCycle = (block.timestamp - deployTime) / CLAIM_INTERVAL;
        // Check if current time is still inside this cycle
        if (
            block.timestamp < deployTime + (currentCycle + 1) * CLAIM_INTERVAL
        ) {
            // We're inside the current cycle – show live percentage
            uint256 userBurn = userCycleBurned[user][currentCycle];
            uint256 totalBurn = cycleTotalBurned[currentCycle];
            if (totalBurn == 0 || userBurn == 0) return 0;
            return (userBurn * BASIS_POINTS) / totalBurn; // basis points (10000 = 100.00%)
        } else {
            // Cycle has ended – show percentage from the previous cycle, if not yet claimed
            if (currentCycle == 0) return 0; // No previous cycle
            uint256 previousCycle = currentCycle - 1;
            if (
                userBurnClaimed[user][previousCycle] ||
                cycleTotalBurned[previousCycle] == 0
            ) {
                return 0;
            }
            uint256 userBurn = userCycleBurned[user][previousCycle];
            uint256 totalBurn = cycleTotalBurned[previousCycle];
            if (totalBurn == 0 || userBurn == 0) return 0;
            return (userBurn * BASIS_POINTS) / totalBurn;
        }
    }
    /*This is an intentional design decision. The contract explicitly rejects all direct ETH transfers to avoid unintended deposits and ensure ETH flows only through authorized logic paths.
    A rescue mechanism is therefore not applicable or necessary in this context. */
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
    fallback() external payable {
        revert("Invalid call");
    }
}
