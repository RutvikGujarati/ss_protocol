// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DAV_V2_2 is
    ERC20,
    Ownable(msg.sender),
    ReentrancyGuard // IERC20 initialization
{
    using SafeERC20 for IERC20;
    IERC20 public StateToken;
    //Global unit256 Variables
    // DAV TOken
	// NOTE: // This contract is intended for PulseChain, not Ethereum.
    uint256 public constant MAX_SUPPLY = 10000000 ether; // 10 Million DAV Tokens
    uint256 public constant TOKEN_COST = 1000 ether; // 1000000 org
    uint256 public constant REFERRAL_BONUS = 5; // 5% bonus for referrers
    uint256 public constant LIQUIDITY_SHARE = 50; // 50% LIQUIDITY SHARE
    uint256 public constant DEVELOPMENT_SHARE = 5; // 5% DEV SHARE
    uint256 public constant HOLDER_SHARE = 10; // 10% HOLDER SHARE
    uint256 public constant BASIS_POINTS = 10000;
	uint256 public constant INITIAL_GOV_MINT = 1000 ether;
	uint256 public constant MAX_TOKEN_PER_USER = 100;
	uint256 public constant DAV_TOKEN_EXPIRE = 50 days; // 50 days for mainnet

    //cycle assinging to 10. not want to update or configure later
    uint256 public constant CYCLE_ALLOCATION_COUNT = 10;
    /// @notice Token processing fee required to execute certain operations.
    /// @dev Intentionally set to 100000 tokens in full native unit (i.e., 100000 ether).
    ///      ⚠️ This is NOT a unit error — the fee is meant to be very high, either for testing,
    ///      access restriction, or deterrence. Adjust only if this is NOT the intended behavior.
	// This contract is intended for PulseChain, not Ethereum.
	// Please note that the value of PLS is significantly lower compared to ETH,
    uint256 public constant TOKEN_PROCESSING_FEE = 10000000 ether;
    uint256 public constant TOKEN_WITHIMAGE_PROCESS = 15000000 ether;
    uint256 public totalReferralRewardsDistributed;
    uint256 public mintedSupply; // Total Minted DAV Tokens
    uint256 public holderFunds; // Tracks ETH allocated for holder rewards
    uint256 public claimStartTime;
    uint256 public totalLiquidityAllocated;
    uint256 public totalDevelopmentAllocated;
    // @notice Tracks the number of DAV token holders
    // @dev Intentionally does not decrement davHoldersCount as token transfers are permanently paused for non-governance addresses, ensuring holders remain in the system
    uint256 public davHoldersCount;
    //-------------------------- State burn ---------------------------
    // Global tracking of total tokens burned across all users and cycles
    // Used in DApp to display total burn statistics
    uint256 public totalStateBurned;
    uint256 public constant TREASURY_CLAIM_PERCENTAGE = 10; // 10% of treasury for claims
    uint256 public constant CLAIM_INTERVAL = 5 minutes; // 36 days claim timer
    uint256 public constant MIN_DAV = 10 * 1e18;
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
    address public  governance;
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
    // @notice Tracks whether an address is a DAV holder
    // @dev Set to true when a user mints tokens and never unset, as transfers are disabled, preventing users from exiting the holder system
    mapping(address => bool) private isDAVHolder;
    mapping(address => uint256) public holderRewards;
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
	address[] public davHolders;
    event TokensBurned(address indexed user, uint256 indexed amount, uint256 cycle);
    event RewardClaimed(address indexed user, uint256 amount, uint256 cycle);
    event RewardsClaimed(address indexed user, uint256 amount);
    event HolderAdded(address indexed holder);
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
        governance = _gov;
        _mint(_gov, INITIAL_GOV_MINT);
        mintedSupply += INITIAL_GOV_MINT;
        StateToken = IERC20(_stateToken);
        claimStartTime = _calculateClaimStart();
    }
	 function _calculateClaimStart() internal view returns (uint256) {
        uint256 dubaiOffset = 4 hours;
        uint256 secondsInDay = 86400;
        uint256 targetDubaiHour = 14; // 5 PM Dubai time
        uint256 targetDubaiMinute = 5;
        // Get current UTC timestamp
        uint256 nowUTC = block.timestamp;
        uint256 nowDubai;
        unchecked {
            // ✅ Safe: 4 hours addition will never overflow
            nowDubai = nowUTC + dubaiOffset;
        }
        uint256 todayStartDubai;
        unchecked {
            // ✅ Safe: all values are well within bounds
            todayStartDubai = (nowDubai / secondsInDay) * secondsInDay;
        }
        uint256 targetTimeDubai;
        unchecked {
            // ✅ Safe: all constants are within time bounds
            targetTimeDubai =
                todayStartDubai +
                targetDubaiHour *
                1 hours +
                targetDubaiMinute *
                1 minutes;
        }
        if (nowDubai >= targetTimeDubai) {
            unchecked {
                // ✅ Safe: adding one day is always within range
                targetTimeDubai += secondsInDay;
            }
        }
        uint256 finalTimestamp;
        unchecked {
            // ✅ Safe: nowDubai >= nowUTC, so subtraction won't underflow
            finalTimestamp = targetTimeDubai - dubaiOffset;
        }
        return finalTimestamp;
    }
    modifier onlyGovernance() {
        require(msg.sender == governance, "Caller is not governance");
        _;
    }
// Step 1: Propose a new governance with timelock
function proposeGovernance(address newGovernance) external onlyGovernance {
    require(newGovernance != address(0), "Invalid governance address");
    pendingGovernance = GovernanceProposal(newGovernance, block.timestamp + 7 days);
}

// Step 2: Confirm governance after timelock expires
function confirmGovernance() external onlyGovernance {
    require(pendingGovernance.newGovernance != address(0), "No pending proposal");
    require(block.timestamp >= pendingGovernance.proposedAt, "Timelock not expired");
    
    address oldGovernance = governance;
    governance = pendingGovernance.newGovernance;
    
    // Clear pending
    delete pendingGovernance;
    
    emit GovernanceUpdated(oldGovernance, governance);
}
function proposeLiquidityWallet(address _newLiquidityWallet) external onlyGovernance {
    require(_newLiquidityWallet != address(0), "Invalid wallet address");
    pendingLiquidityWallet = WalletUpdateProposal(_newLiquidityWallet, block.timestamp + 7 days); 
}

function confirmLiquidityWallet() external onlyGovernance {
    require(pendingLiquidityWallet.newWallet != address(0), "No pending proposal");
    require(block.timestamp >= pendingLiquidityWallet.proposedAt, "Timelock not expired");
    liquidityWallet = pendingLiquidityWallet.newWallet;
    delete pendingLiquidityWallet;
    emit LiquidityWalletUpdated(liquidityWallet);
}
function proposeDevelopmentWallet(address _newDevelopmentWallet) external onlyGovernance {
    require(_newDevelopmentWallet != address(0), "Invalid wallet address");
    pendingDevelopmentWallet = WalletUpdateProposal(_newDevelopmentWallet, block.timestamp + 7 days);
}

function confirmDevelopmentWallet() external onlyGovernance {
    require(pendingDevelopmentWallet.newWallet != address(0), "No pending proposal");
    require(block.timestamp >= pendingDevelopmentWallet.proposedAt, "Timelock not expired");
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
            _assignReferralCodeIfNeeded(recipient); // safe, only if no code
			   mintBatches[recipient].push(MintBatch({
    			amount: amount,
    			timestamp: block.timestamp,
				fromGovernance: true
			}));
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
			mintBatches[recipient].push(MintBatch({
    			amount: amount,
    			timestamp: block.timestamp,
				fromGovernance: true
			}));
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
	/**
 * @notice Updates the DAV holder status for a given account based on their active balance.
 * @dev 
 * - Adds the account to `davHolders` if they have an active balance and aren't already registered.
 * - Removes the account from `davHolders` if they no longer have an active balance.
 * - Skips updating if the account is the governance address.
 * @param account The address of the user whose holder status is being updated.
 */
  function _updateHolderStatus(address account) internal {
    bool hasActiveBalance = getActiveBalance(account) > 0;
    // If should be added
    if (
        hasActiveBalance &&
        account != governance     ) {
        if (!isDAVHolder[account]) {
            isDAVHolder[account] = true;
            davHoldersCount += 1;
            // FINAL GUARD: prevent duplicate
            bool alreadyExists = false;
            for (uint256 i = 0; i < davHolders.length; i++) {
                if (davHolders[i] == account) {
                    alreadyExists = true;
                    break;
                }
            }
            if (!alreadyExists) {
                davHolders.push(account);
                emit HolderAdded(account);
            }
        }
    }    // If should be removed
    else if (!hasActiveBalance && isDAVHolder[account]) {
        isDAVHolder[account] = false;
        davHoldersCount -= 1;
        for (uint256 i = 0; i < davHolders.length; i++) {
            if (davHolders[i] == account) {
                davHolders[i] = davHolders[davHolders.length - 1];
                davHolders.pop();
                break;
            }
        }
    }
}
      function earned(address account) public view returns (uint256) {
        if (account == governance) {
            return 0;
        }
        return holderRewards[account];
    }
    /**
     * @notice Generates a unique referral code for a given user
     * @dev Uses internal entropy and a nonce to prevent collisions
     * @param user The address of the user for whom the code is generated
     * @return code A unique 8-character alphanumeric referral code
     */
	 //The library is not required here to generate referral code
   function _generateReferralCode(address user) internal returns (string memory code) {
    userNonce[user]++;
    uint256 maxAttempts = 10;
    for (uint256 i = 0; i < maxAttempts; i++) {
        bytes32 hash = keccak256(abi.encodePacked(user, userNonce[user], i));
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
/// @notice Calculates ETH distribution for minting
/// @param value ETH amount to distribute
/// @param sender Sender of the ETH
/// @param referralCode Optional referral code
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
        // Exclude governance address from receiving holder share
        bool excludeHolderShare = sender == governance;
        require(!excludeHolderShare || sender != address(0), "Invalid governance address");

        // Calculate shares as percentages of value
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
        }
        // If no holders or total supply is 0, redirect holder share to liquidityShare
        if (davHoldersCount == 0 || getTotalActiveSupply() == 0) {
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
// This loop is safe under typical block gas limits (~30 million gas)
// Each iteration is lightweight and avoids nested expensive operations
function _distributeHolderShare(uint256 holderShare) internal {
    if (holderShare == 0) return;
    uint256 totalActiveMintedSupply = 0;
    address[] memory eligibleHolders = new address[](davHolders.length);
    uint256 count = 0;
    // First pass: calculate total eligible supply
    for (uint256 i = 0; i < davHolders.length; i++) {
        address holder = davHolders[i];
        if (holder != governance) {
            uint256 active = getActiveMintedBalance(holder);
            if (active > 0) {
                eligibleHolders[count++] = holder;
                totalActiveMintedSupply += active;
            }
        }
    }
    if (totalActiveMintedSupply == 0) return;
    uint256 totalDistributed = 0;
    address lastEligible;
    // Second pass: distribute
    for (uint256 i = 0; i < count; i++) {
        address holder = eligibleHolders[i];
        uint256 balance = getActiveMintedBalance(holder);
        if (balance > 0) {
            uint256 portion = (holderShare * balance) / totalActiveMintedSupply;
            holderRewards[holder] += portion;
            totalDistributed += portion;
            lastEligible = holder;
        }
    }
    // Remainder: send to last holder
    if (totalDistributed < holderShare && lastEligible != address(0)) {
        uint256 remainder = holderShare - totalDistributed;
        holderRewards[lastEligible] += remainder;
        totalDistributed += remainder;
    }
    holderFunds += totalDistributed;
}


function _distributeCycleAllocations(uint256 stateLPShare, uint256 currentCycle, uint256 treasuryClaimPercentage) internal {
    // Calculate allocation per cycle based on stateLPShare and treasury percentage
    uint256 cycleAllocation = (stateLPShare * treasuryClaimPercentage) / 100;
    // Distribute allocations across CYCLE_ALLOCATION_COUNT (10) cycles.
    // This loop is necessary to spread the treasury allocation across multiple
    // future cycles to align with the protocol's treasury claiming mechanism.
    // With CYCLE_ALLOCATION_COUNT fixed at 10, the gas cost is bounded and
    // acceptable, as each iteration performs two storage writes. We avoid
    // complex optimizations like single-cycle aggregation or off-chain calculations
    // to maintain clear, predictable logic that ensures funds are distributed
    // across the intended cycles, as required by the protocol.
    for (uint256 i = 0; i < CYCLE_ALLOCATION_COUNT; i++) {
        uint256 targetCycle = currentCycle + i;
        cycleTreasuryAllocation[targetCycle] += cycleAllocation;
        cycleUnclaimedPLS[targetCycle] += cycleAllocation;
    }
}
/// @notice Mints DAV tokens and distributes ETH to stakeholders.
/// @param amount Tokens to mint (in wei).
/// @param referralCode Optional referrer code for rewards.
    function mintDAV(uint256 amount, string memory referralCode) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        // Checks
        require(amount > 0, "Amount must be greater than zero");
		require(msg.sender != governance, "Governance cannot mint");
        require(amount % 1 ether == 0, "Amount must be a whole number");
        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");
        uint256 cost = (amount * TOKEN_COST) / 1 ether;
        require(msg.value == cost, "Incorrect PLS amount sent");

        // Calculate distribution
        (
            uint256 holderShare,
            uint256 liquidityShare,
            uint256 developmentShare,
            uint256 referralShare,
            uint256 stateLPShare,
            address referrer
        ) = _calculateETHDistribution(msg.value, msg.sender, referralCode);

        // Effects
        mintedSupply += amount;
        mintBatches[msg.sender].push(MintBatch({
            amount: amount,
            timestamp: block.timestamp,
			fromGovernance: false
        }));
        // Generate referral code if not already set
        if (bytes(userReferralCode[msg.sender]).length == 0) {
            string memory newReferralCode = _generateReferralCode(msg.sender);
            userReferralCode[msg.sender] = newReferralCode;
            referralCodeToUser[newReferralCode] = msg.sender;
            emit ReferralCodeGenerated(msg.sender, newReferralCode);
        }
		// Update holder  before distributing
        _updateHolderStatus(msg.sender);
      	// Distribute holder rewards
   	 	_distributeHolderShare(holderShare);
        // Handle cycle allocations
    	uint256 currentCycle = getCurrentClaimCycle();
    	_distributeCycleAllocations(stateLPShare, currentCycle, TREASURY_CLAIM_PERCENTAGE);
        // Mint tokens
        _mint(msg.sender, amount);

        // Interactions
        if (referrer != address(0) && referralShare > 0) {
            require(address(referrer).code.length == 0, "Referrer is a contract");
            referralRewards[referrer] += referralShare;
            totalReferralRewardsDistributed += referralShare;
            (bool successRef, ) = referrer.call{value: referralShare}("");
            require(successRef, "Referral transfer failed");
        }

       if (liquidityShare > 0) {
		 require(address(liquidityWallet).code.length == 0, "Liquidity wallet is a contract");
        totalLiquidityAllocated += liquidityShare;
        (bool successLiquidity, ) = liquidityWallet.call{value: liquidityShare}("");
        require(successLiquidity, "Liquidity transfer failed");
    }
    if (developmentShare > 0) {
	   require(address(developmentWallet).code.length == 0, "development Wallet is a contract");
        totalDevelopmentAllocated += developmentShare;
        (bool successDev, ) = developmentWallet.call{value: developmentShare}("");
        require(successDev, "Development transfer failed");
    }
	emit DistributionEvent(   msg.sender,    amount,    msg.value,    referrer,    referralShare,   liquidityShare,    developmentShare,	holderShare,    block.timestamp
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
function getActiveMintedBalance(address account) public view returns (uint256) {
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

function getMintTimestamps(address user) external view returns (uint256[] memory mintTimes, uint256[] memory expireTimes) {
    MintBatch[] storage batches = mintBatches[user];
    uint256 len = batches.length;

    mintTimes = new uint256[](len);
    expireTimes = new uint256[](len);

    for (uint256 i = 0; i < len; i++) {
        mintTimes[i] = batches[i].timestamp;
        expireTimes[i] = batches[i].timestamp + DAV_TOKEN_EXPIRE;
    }

    return (mintTimes, expireTimes);
}

function getTotalActiveSupply() public view returns (uint256) {
	 /*  Iterate over all DAV holders to calculate the total active supply.This loop is gas-intensive but necessary for accurate, real-time calculation of active token balances. which constrains the array size and keeps gas costs manageable for the expected user base. We avoid complex optimizations like
   caching or snapshots to maintain clear, straightforward logic, accepting the gas cost as a trade-off for simplicity and transparency. */
    uint256 total = 0;
    for (uint256 i = 0; i < davHolders.length; i++) {
        total += getActiveBalance(davHolders[i]);
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

 function claimReward() external
		payable
        nonReentrant
        whenNotPaused
    {
		address user = msg.sender;
        require(user != address(0), "Invalid user");
        require(
            msg.sender != governance,
            "Not eligible to claim rewards"
        );
        // Update holder status to check for expiration
        _updateHolderStatus(msg.sender);
        // Calculate claimable reward
        uint256 reward = earned(msg.sender);
        require(reward > 0, "No rewards to claim");
        require(holderFunds >= reward, "Insufficient holder funds");
        // Update state
        holderRewards[msg.sender] = 0;
        holderFunds -= reward;
        // Transfer reward
        (bool success, ) = user.call{value: reward, gas: 30000}("");
        require(success, "Reward transfer failed");
        emit RewardsClaimed(msg.sender, reward);
    }

    function getDAVHoldersCount() external view returns (uint256) {
        return davHoldersCount;
    }
   
    function getUserReferralCode(
        address user
    ) external view returns (string memory) {
        return userReferralCode[user];
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
) public payable whenNotPaused {
    // Validate input: Ensure token name is not empty
    require(bytes(_tokenName).length > 0, "Please provide tokenName");
	require(bytes(_tokenName).length <= 64, "Token name too long");
  // Lock token name immediately to reserve it for the user.
    // This check ensures the token name hasn't been claimed by another user.
    // By setting isTokenNameUsed[_tokenName] = true early, we minimize the window
    // for front-running within the transaction execution. However, front-running
    // a competing transaction with higher gas fees. We acknowledge this as a
    // UX trade-off, opting for simplicity over a commit-reveal scheme to avoid
    // requiring users to submit two transactions.    
	require(!isTokenNameUsed[_tokenName], "Token name already used");
    // Ensure the user hasn't already claimed this token name
    require(userTokenEntries[msg.sender][_tokenName].user == address(0), "Token name already used by user");
   // Assign ownership and mark the token name as used to secure it for the user.
    // This immediate assignment ensures the first valid transaction to execute
    // claims the name, reducing the risk of name sniping within the transaction.
    isTokenNameUsed[_tokenName] = true;
    tokenNameToOwner[_tokenName] = msg.sender;
    // Check if the provided emoji/image is a valid IPFS link (Pinata)
    bool isImage = _isImageURL(_emojiOrImage);
    // Validate emoji length if not an image (max 10 UTF-8 characters)
    if (!isImage) {
        require(_utfStringLength(_emojiOrImage) <= 10, "Max 10 UTF-8 characters allowed");
    }else{
		require(bytes(_emojiOrImage).length <= 256, "URL too long");
	}
    // Verify user has sufficient token balance to process a new token
    uint256 userTokenBalance = getActiveBalance(msg.sender);
    uint256 tokensSubmitted = userTokenCount[msg.sender];
    // Handle fee logic for non-governance users
    if (msg.sender != governance) {
        // Determine required fee based on whether an image is used
        uint256 requiredFee = getTokenProcessingFee(isImage);
   		require(userTokenBalance > tokensSubmitted, "You need more DAV to process new token");
        require(msg.value == requiredFee, isImage ? "Please send exact image fee" : "Please send exactly 100,000 PLS");
        // Distribute fee to treasury across multiple cycles
        uint256 stateLPShare = msg.value;
   		uint256 currentCycle = getCurrentClaimCycle();
        _distributeCycleAllocations(stateLPShare, currentCycle, TREASURY_CLAIM_PERCENTAGE);
    }
    // Store token details for the user
    usersTokenNames[msg.sender].push(_tokenName);
    userTokenCount[msg.sender]++;
    allTokenNames.push(_tokenName);
    // Create and store token entry with pending status
    userTokenEntries[msg.sender][_tokenName] = TokenEntry(
        msg.sender,
        _tokenName,
        _emojiOrImage,
        TokenStatus.Pending
    );
    // Emit event to signal successful token name addition
    emit TokenNameAdded(msg.sender, _tokenName);
}
function getTokenProcessingFee(bool isImage) public pure returns (uint256) {
    return isImage ? TOKEN_WITHIMAGE_PROCESS : TOKEN_PROCESSING_FEE;
}
function _contains(string memory str, string memory substr) internal pure returns (bool) {
    bytes memory strBytes = bytes(str);
    bytes memory substrBytes = bytes(substr);
    if (substrBytes.length == 0 || substrBytes.length > strBytes.length) return false;
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
            if (b >> 7 == 0) {                i += 1; // 1-byte character (ASCII)
            } else if (b >> 5 == 0x6) {                i += 2; // 2-byte character
            } else if (b >> 4 == 0xE) {                i += 3; // 3-byte character
            } else if (b >> 3 == 0x1E) {
                i += 4; // 4-byte character (emojis, many symbols)
            } else {                revert("Invalid UTF-8 character");            }
            length++;
        }
    }
    // allTokenEntries is implicitly bounded by each user's DAV balance.
    // Each user can only submit one token per DAV they hold, and DAV itself is capped.
    // This natural upper bound eliminates the need for a hardcoded limit like 1,000 entries.
    /// @notice Returns the list of pending token names for a user.
    /// @dev This function is intended for off-chain use only. It may consume too much gas if called on-chain for users with many entries.
function getPendingTokenNames(address user) public view returns (string[] memory) {
    // Ensure user has not exceeded the maximum token limit
    require(userTokenCount[user] <= MAX_TOKEN_PER_USER, "Token limit exceeded");
    // Get the user's token names array
    string[] memory allTokens = usersTokenNames[user];
    uint256 totalTokens = allTokens.length;
    // Pre-allocate result array with maximum possible size (bounded by MAX_TOKEN_PER_USER)
    string[] memory temp = new string[](totalTokens);
    uint256 count = 0;
    // Single loop to collect pending token names
    for (uint256 i = 0; i < totalTokens; i++) {
        // Check if the token has a pending status
        if (userTokenEntries[user][allTokens[i]].status == TokenStatus.Pending) {
            temp[count] = allTokens[i];
            count++;
        }
    }    // Create final result array with exact size to avoid wasting gas
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
	//want to fetch all entries not perticular from start to end
	function getTokenEntries(uint256 start, uint256 limit) internal view returns (TokenEntry[] memory) {
    uint256 end = start + limit > allTokenNames.length ? allTokenNames.length : start + limit;
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
    function burnState(uint256 amount) external whenNotPaused {
 	if (msg.sender != governance) {
        require(
            getActiveBalance(msg.sender) >= MIN_DAV,
            "Need at least 10 DAV (maybe you have expired tokens)"
        );
    }    
		require(amount > 0, "Burn amount must be > 0");
		require(block.timestamp >= claimStartTime, "Burning not allowed yet. Timer hasn't started.");
        require(
            StateToken.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        uint256 currentCycle = getCurrentClaimCycle();
        // Ensure user has no unclaimed rewards before burning
        // Simplifies state management by enforcing claim-before-burn
        require(
            !canClaim(msg.sender),
            "Must claim previous rewards before burning"
        );
        // Update burn tracking mappings for DApp display
        totalStateBurned += amount; // Global burn total
        userBurnedAmount[msg.sender] += amount; // User total burn
        userCycleBurned[msg.sender][currentCycle] += amount; // User cycle burn
        cycleTotalBurned[currentCycle] += amount; // Cycle total burn
        // Calculate user share for this cycle (in 1e18 precision)
        uint256 userShare = cycleTotalBurned[currentCycle] > 0
            ? (userCycleBurned[msg.sender][currentCycle] * 1e18) /
                cycleTotalBurned[currentCycle]
            : 1e18; // 100% if first burner in cycle
        // NEW: Add cycle to userUnclaimedCycles if not already present
        // Ensures claimPLS() only checks relevant cycles
        bool cycleExists = false;
        for (uint256 i = 0; i < userUnclaimedCycles[msg.sender].length; i++) {
            if (userUnclaimedCycles[msg.sender][i] == currentCycle) {
                cycleExists = true;
                break;
            }
        }
        if (!cycleExists) {
            userUnclaimedCycles[msg.sender].push(currentCycle);
        }
        // Log burn in history for DApp display
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
        lastBurnCycle[msg.sender] = currentCycle;
        // Transfer and burn tokens
        StateToken.safeTransferFrom(msg.sender, BURN_ADDRESS, amount);
        emit TokensBurned(msg.sender, amount, currentCycle);
    }
    // Check if a user has claimable rewards
    function canClaim(address user) public view returns (bool) {
        uint256 currentCycle = getCurrentClaimCycle();
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
        uint256 currentCycle = getCurrentClaimCycle();
        uint256 totalClaimable = 0;
        // Iterate over user's unclaimed cycles
        for (uint256 i = 0; i < userUnclaimedCycles[user].length; i++) {
            uint256 cycle = userUnclaimedCycles[user][i];
			 // --- Invariant Checks ---
        // Ensure the mappings aren't out of sync
      	  assert(userCycleBurned[user][cycle] > 0 || hasClaimedCycle[user][cycle]); // either burned or already claimed
        	assert(cycle <= currentCycle); // never from the future
        // ------------------------
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
            uint256 userShare = (userBurn * 1e18) / totalBurn;
            uint256 cycleReward = (cycleTreasuryAllocation[cycle] * userShare) /
                1e18;
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
	/// @dev Requires that the claim period has started (current cycle > 0).
/// @dev Reverts if there are no rewards to claim or if the contract balance is insufficient.
/// @custom:security non-reentrant and used pagination of 10 previous cycle

function claimPLS() external whenNotPaused {
    address user = msg.sender;
    uint256 currentCycle = getCurrentClaimCycle();
		// Checks: require checks for user eligibility and claim period
    require(currentCycle > 0, "Claim period not started");
    uint256 totalReward = 0;
    uint256 startCycle = currentCycle > 10 ? currentCycle - 10 : 0;
	    // Effects: accumulate rewards and update state before external call
    for (uint256 cycle = startCycle; cycle < currentCycle; cycle++) {
        if (
            cycleTreasuryAllocation[cycle] == 0 ||
            hasClaimedCycle[user][cycle]
        ) continue;
        uint256 userBurn = userCycleBurned[user][cycle];
        uint256 totalBurn = cycleTotalBurned[cycle];
        if (userBurn == 0 || totalBurn == 0) continue;
        uint256 reward = (cycleTreasuryAllocation[cycle] * userBurn) / totalBurn;
        if (cycleUnclaimedPLS[cycle] < reward) continue;
        cycleUnclaimedPLS[cycle] -= reward;
        hasClaimedCycle[user][cycle] = true;
        userBurnClaimed[user][cycle] = true;
        totalReward += reward;
		  // Invariant check: unclaimed must never exceed allocated
        require(
            cycleUnclaimedPLS[cycle] <= cycleTreasuryAllocation[cycle],
            "Invariant failed: cycleUnclaimed > treasuryAllocation"
        );
    }
    // Update burnHistory
    for (uint256 j = 0; j < burnHistory[user].length; j++) {
		        uint256 cycleNum = burnHistory[user][j].cycleNumber;
        if (!burnHistory[user][j].claimed && hasClaimedCycle[user][burnHistory[user][j].cycleNumber]) {
            burnHistory[user][j].claimed = true;
        }
		   // Invariant check: burnHistory must reflect claimed mapping
        require(
            burnHistory[user][j].claimed == hasClaimedCycle[user][cycleNum],
            "Invariant failed: burnHistory.claimed != hasClaimedCycle"
        );
    }
    require(totalReward > 0, "Nothing to claim");
    require((address(this).balance - holderFunds) >= totalReward, "Insufficient contract balance");
	// Interaction: external call last to transfer PLS to user
    (bool success, ) = payable(user).call{value: totalReward}("");
    require(success, "PLS transfer failed");
    emit RewardClaimed(user, totalReward, currentCycle);
}

  function getCurrentClaimCycle() public view returns (uint256) {
    return (block.timestamp - claimStartTime) / CLAIM_INTERVAL;
}

    function getAvailableCycleFunds() public view returns (uint256) {
        uint256 currentCycle = getCurrentClaimCycle();
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
    if (block.timestamp < claimStartTime + CLAIM_INTERVAL) {
        return (claimStartTime + CLAIM_INTERVAL) - block.timestamp;
    }

    uint256 currentCycle = getCurrentClaimCycle();
    uint256 nextClaimableAt = claimStartTime + (currentCycle + 1) * CLAIM_INTERVAL;
    return
        nextClaimableAt > block.timestamp
            ? nextClaimableAt - block.timestamp
            : 0;
}
function hasClaimingStarted() public view returns (bool) {
    return block.timestamp >= claimStartTime;
}

    function getContractPLSBalance() external view returns (uint256) {
        return address(this).balance - holderFunds;
    }
   function getUserSharePercentage(address user) external view returns (uint256) {
    uint256 currentCycle = getCurrentClaimCycle();

    // Determine cycle end time
    uint256 currentCycleEnd = claimStartTime + (currentCycle + 1) * CLAIM_INTERVAL;

    // Case 1: We're still inside the current cycle
    if (block.timestamp < currentCycleEnd) {
        uint256 userBurn = userCycleBurned[user][currentCycle];
        uint256 totalBurn = cycleTotalBurned[currentCycle];
        if (userBurn == 0 || totalBurn == 0) return 0;
        return (userBurn * BASIS_POINTS) / totalBurn;
    }

    // Case 2: Current cycle is over, show previous if not claimed
    if (currentCycle == 0) return 0; // No previous cycle
    uint256 previousCycle = currentCycle - 1;

    if (
        userBurnClaimed[user][previousCycle] ||
        userCycleBurned[user][previousCycle] == 0 ||
        cycleTotalBurned[previousCycle] == 0
    ) {
        return 0;
    }

    return (userCycleBurned[user][previousCycle] * BASIS_POINTS) / cycleTotalBurned[previousCycle];
}

    receive() external payable {        revert("Direct ETH transfers not allowed");    }
    fallback() external payable {        revert("Invalid call");    }
}