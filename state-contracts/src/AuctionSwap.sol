// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {DAV_V2_2} from "./DavToken.sol";
import {TOKEN_V2_2} from "./Tokens.sol";

interface IPair {
    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}
contract SWAP_V2_2 is Ownable(msg.sender), ReentrancyGuard {
    using SafeERC20 for IERC20;
    DAV_V2_2 public dav;

    struct AuctionCycle {
        uint256 firstAuctionStart;
        bool isInitialized;
        uint256 auctionCount;
    }

    struct UserSwapInfo {
        bool hasSwapped;
        bool hasReverseSwap;
        uint256 cycle;
    }

    //For Airdrop
    uint256 public constant AUCTION_INTERVAL = 50 days;
    uint256 public constant AUCTION_DURATION = 24 hours;
    uint256 public constant REVERSE_DURATION = 24 hours;
    uint256 public constant MAX_AUCTIONS = 20;
    uint256 public constant OWNER_REWARD_AMOUNT = 2500000 ether;
    uint256 public constant CLAIM_INTERVAL = 50 days;
    uint256 public constant MAX_SUPPLY = 500000000000 ether;
	uint256 constant MIN_DAV_REQUIRED = 1 ether;
    uint256 constant DAV_FACTOR = 5000000 ether;
    //For Airdrop
    uint256 constant AIRDROP_AMOUNT = 10000 ether;
    uint256 constant TOKEN_OWNER_AIRDROP = 1500000 ether;
    uint256 constant GOV_OWNER_AIRDROP = 150000 ether;
    uint256 constant PRECISION_FACTOR = 1e18;
    uint256 public constant percentage = 1;
    //it is used for pulsechain and it is standered burn address
    address private constant BURN_ADDRESS =
        0x0000000000000000000000000000000000000369;
    uint256 public TotalBurnedStates;
	uint256 public constant MAX_USER_AIRDROP = 30000000 ether;
	uint256 public constant MAX_GOV_AIRDROP = 3000000 ether;
    address public stateToken;
    address public governanceAddress;
    address public DevAddress;
    uint256 public constant GOVERNANCE_UPDATE_DELAY = 7 days;
    address public pendingGovernance;
    uint256 public governanceUpdateTimestamp;
	bool public paused = false;

    mapping(address => mapping(address => uint256)) public lastDavHolding; // user => token => last DAV holding
    mapping(address => mapping(address => uint256))
        public cumulativeDavHoldings;
    // Map user => array of deployed token names
    mapping(address => string[]) public userToTokenNames;

    // Map user + token name => token address
    mapping(address => mapping(string => address)) public deployedTokensByUser;

    mapping(address => address) public pairAddresses; // token => pair address
    mapping(address => bool) public usedPairAddresses;
    mapping(address => bool) public supportedTokens; // token => isSupported
    mapping(address => address) public tokenOwners; // token => owner
    mapping(address => address[]) public ownerToTokens;
    mapping(string => bool) public isTokenNameUsed;

    mapping(address => mapping(address => uint256)) public lastClaimTime;
    mapping(string => string) public tokenNameToEmoji;
	mapping(bytes32 => UserSwapInfo) public userSwapTotalInfo;

	// user => inputToken => stateToken => cycle => UserSwapInfo
    mapping(address => mapping(address => AuctionCycle)) public auctionCycles; // inputToken => stateToken => AuctionCycle
    mapping(address => uint256) public TotalStateBurnedByUser;
    mapping(address => uint256) public TotalTokensBurned;
    mapping(address => mapping(address => bool)) public hasClaimed; // user => token => has claimed
	mapping(address => uint256) public totalClaimedByUser;
	mapping(address => uint256) public totalClaimedByGovernance;


    event AuctionStarted(
        uint256 startTime,
        uint256 endTime,
        address inputToken,
        address stateToken
    );
	event TokenDeployed(string name, address tokenAddress) ;
    event TokensDeposited(address indexed token, uint256 amount);
    event RewardDistributed(address indexed user, uint256 amount);
    event TokensSwapped(
        address indexed user,
        address indexed inputToken,
        address indexed stateToken,
        uint256 amountIn,
        uint256 amountOut
    );
    event TokenAdded(address indexed token, address pairAddress);
    event GovernanceUpdateProposed(address newGov, uint256 timestamp);
    event GovernanceUpdated(address newGov);
	event ContractPaused(address by);
	event ContractUnpaused(address by);
    // Custom Errors are not required
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "Swapping: You are not authorized to perform this action"
        );
        _;
    }
	modifier onlyTokenOwnerOrGovernance(address token) {
    require(
        msg.sender == tokenOwners[token] || msg.sender == governanceAddress,
        "Unauthorized: Only token owner or governance allowed"
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
    constructor(address _gov, address _dev) {
        governanceAddress = _gov;
        DevAddress = _dev;
    }
   // Function to propose a new governance address
	// Only the current governance can call this
function updateGovernance(address newGov) external onlyGovernance {
    // Prevent setting governance to the zero address to avoid losing control
    require(newGov != address(0), "RSA: Invalid governance address");
    // Store the proposed governance address
    pendingGovernance = newGov;
	governanceUpdateTimestamp = block.timestamp + GOVERNANCE_UPDATE_DELAY; // set delay
    // Emit event to log the proposal for external monitoring
    emit GovernanceUpdateProposed(newGov,block.timestamp);
}

// Function to confirm the governance update
// Only the current governance can call this
function confirmGovernanceUpdate() external onlyGovernance {
    // Ensure a pending governance address exists
    require(pendingGovernance != address(0), "RSA: No pending governance");
	require(block.timestamp >= governanceUpdateTimestamp, "RSA: Timelock not expired");
    // Transfer governance to the proposed address
    governanceAddress = pendingGovernance;
    // Clear pending governance to prevent accidental reuse
    pendingGovernance = address(0);
	 governanceUpdateTimestamp = 0;
    // Emit event to log the successful governance update
    emit GovernanceUpdated(governanceAddress);
}
    //to deposit tokens if needed
    function depositTokens(
        address token,
        uint256 amount
    ) external onlyGovernance {
        require(amount > 0, "RSA: Invalid deposit amount");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit TokensDeposited(token, amount);
    }
    // Deploy a Token
    function deployUserToken(
        string memory name,
        string memory symbol,
        string memory emojies,
        address _One,
        address _swap,
        address _owner
    ) external onlyGovernance returns (address) {
        require(!isTokenNameUsed[name], "Token name already used");
		require(    _One != address(0) &&    _swap != address(0) &&    _owner != address(0),
   		 "Invalid addresses");
		require(    bytes(name).length > 0 &&    bytes(symbol).length > 0,    "Invalid token metadata");

        require(
            deployedTokensByUser[msg.sender][name] == address(0),
            "Token address should not be zero"
        );

        TOKEN_V2_2 token = new TOKEN_V2_2(name, symbol, _One, _swap, _owner);
        deployedTokensByUser[msg.sender][name] = address(token);
        userToTokenNames[msg.sender].push(name);
        isTokenNameUsed[name] = true;
        tokenNameToEmoji[name] = emojies;

        emit TokenDeployed(name, address(token));
        return address(token);
    }
    // Add and start Auction
    function addToken(
        address token,
        address pairAddress,
        address _tokenOwner
    ) external onlyGovernance {
        IPair pair = IPair(pairAddress);
        require(
            (pair.token0() == token && pair.token1() == stateToken) ||
                (pair.token1() == token && pair.token0() == stateToken),
   		 "RSA: Pair must contain stateToken"
        );
        require(token != address(0), "Invalid token address");
        require(stateToken != address(0), "State token not initialized");
        require(pairAddress != address(0), "Invalid pair address");
        require(pairAddress != token, "Invalid pair address");
        require(!supportedTokens[token], "Token already added");
        require(!usedPairAddresses[pairAddress], "Pair address already used");
		require(_tokenOwner != address(0), "Invalid token owner");
        supportedTokens[token] = true;
        tokenOwners[token] = _tokenOwner;
        pairAddresses[token] = pairAddress;
        ownerToTokens[_tokenOwner].push(token);
        usedPairAddresses[pairAddress] = true;
        // Schedule auction at 22:30 Dubai time (UTC+4)
        uint256 auctionStart = _calculateDubaiAuctionStart();
        // Initialize auction cycle for token → stateToken
        AuctionCycle storage forwardCycle = auctionCycles[token][stateToken];
        forwardCycle.firstAuctionStart = auctionStart;
        forwardCycle.isInitialized = true;
        forwardCycle.auctionCount = 0;
        // Initialize auction cycle for stateToken → token
        AuctionCycle memory reverseCycle = AuctionCycle({
            firstAuctionStart: auctionStart,
            isInitialized: true,
            auctionCount: 0
        });
        auctionCycles[stateToken][token] = reverseCycle;
        emit TokenAdded(token, pairAddress);
        emit AuctionStarted(
            auctionStart,
            auctionStart + AUCTION_DURATION,
            token,
            stateToken
        );
    }
    /// @notice Calculates the next Dubai auction start time in UTC
    /// @dev Target time is 17:00 Dubai time (UTC+4). Uses `unchecked` for safe, gas-efficient arithmetic.
    function _calculateDubaiAuctionStart() internal view returns (uint256) {
        uint256 dubaiOffset = 4 hours;
        uint256 secondsInDay = 86400;
        uint256 targetDubaiHour = 18; // 6 PM Dubai time
        uint256 targetDubaiMinute = 0;
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

 /**
 * @notice Returns the spot price ratio between the input token and state token based on DEX reserves.
 * @dev This function intentionally uses live on-chain reserves instead of TWAP or oracle feeds.
 *      Rationale:
 * - The protocol computes `amountIn` internally (users do not input it), mitigating manipulation risk.
 * - Each user can swap only once per auction cycle (enforced via userSwapInfo flags).
 * - Auctions are time-limited, and reverse/normal swaps are auction-based, making flash loan attacks ineffective.
 * - Additional checks (e.g., DAV balance, cycle tracking, vault balance) ensure security and fairness.
 * - TWAP adds unnecessary complexity and delay, while spot pricing keeps the system responsive.
 * @param inputToken The ERC20 token whose price ratio with the stateToken is to be calculated.
 * @return ratio The spot price ratio (scaled by PRECISION_FACTOR, typically 1e18).
 */
    function getRatioPrice(address inputToken) public view returns (uint256) {
        require(supportedTokens[inputToken], "Unsupported token");
        IPair pair = IPair(pairAddresses[inputToken]);
		/// @notice Returns the price ratio of a supported input token to the state token.
		/// @dev Calls `getReserves()` on trusted LP contracts only.
		///      External call is safe because:
		///      - `pairAddresses` is populated only with audited or whitelisted contracts.
		///      - `getReserves()` is known to revert cleanly or return valid values.
		///      - Additional internal checks ensure reserves > 0 and token pair is valid.
		///   ⚠️ No try/catch is used intentionally to reduce gas; caller must trust registered LPs.
       try pair.getReserves() returns (uint112 reserve0, uint112 reserve1, uint32) {
        address token0 = pair.token0();
        address token1 = pair.token1();

        require(reserve0 > 0 && reserve1 > 0, "Invalid reserves");

        uint256 ratio;
        if (token0 == inputToken && token1 == stateToken) {
            ratio = (uint256(reserve1) * PRECISION_FACTOR) / uint256(reserve0);
        } else if (token0 == stateToken && token1 == inputToken) {
            ratio = (uint256(reserve0) * PRECISION_FACTOR) / uint256(reserve1);
        } else {
            revert("Invalid pair");
        }

        return ratio;// retains 18 decimals
   		 } catch {
        revert("Failed to fetch reserves");
    	} 
    }

   /// @notice Distributes airdrop rewards based on new DAV holdings.
/// @param user The user claiming rewards.
/// @param inputToken The token for reward calculation.
    function distributeReward(
        address user,
        address inputToken
    ) external nonReentrant whenNotPaused{
        // **Checks**
        require(user != address(0), "Invalid user address");
        require(supportedTokens[inputToken], "Unsupported token");
        require(msg.sender == user, "Invalid sender");
        uint256 currentDavHolding = getDavBalance(user);
        uint256 lastHolding = lastDavHolding[user][inputToken];
        uint256 newDavContributed = currentDavHolding > lastHolding
            ? currentDavHolding - lastHolding
            : 0;
        require(newDavContributed > 0, "No new DAV holdings for this token");
        // **Effects**
        uint256 reward = (newDavContributed * AIRDROP_AMOUNT + PRECISION_FACTOR - 1) / PRECISION_FACTOR;
		require(reward > 0, "Reward too small");
        cumulativeDavHoldings[user][inputToken] += newDavContributed;
        lastDavHolding[user][inputToken] = currentDavHolding;
        hasClaimed[user][inputToken] = true;
        // **Interactions**
        IERC20(inputToken).safeTransfer(msg.sender, reward);
        emit RewardDistributed(user, reward);
    }

    function giveRewardToTokenOwner(address token) public nonReentrant onlyTokenOwnerOrGovernance(token) {
        // Check if the token has a registered owner
        address owner = tokenOwners[token];
        require(owner != address(0), "Token has no registered owner");
        // Determine claimant and reward amount
        address claimant;
        uint256 rewardAmount;
        if (msg.sender == governanceAddress) {
		// If called by governance, reward goes to DevAddress with GOV_OWNER_AIRDROP amount
            claimant = DevAddress;
            rewardAmount = GOV_OWNER_AIRDROP;
			  // Enforce governance airdrop cap
        require(
            totalClaimedByGovernance[claimant] + rewardAmount <= MAX_GOV_AIRDROP,
            "Governance airdrop limit reached"
        );
        } else {
		// If called by anyone else, must be the token owner
        // Ensure msg.sender is the token owner - prevents unauthorized claims
            require(
                msg.sender == owner,
                "Only token owner or governance can claim"
            );
            require(
                getDavBalance(owner) >= PRECISION_FACTOR,
                "Owner must hold at least 1 DAV"
            );
            claimant = owner;
            rewardAmount = TOKEN_OWNER_AIRDROP;
			   // Enforce user airdrop cap
        require(
            totalClaimedByUser[claimant] + rewardAmount <= MAX_USER_AIRDROP,
            "User airdrop limit reached"
        );
        }
        // Enforce claim interval
        uint256 lastClaim = lastClaimTime[claimant][token];
        require(
            block.timestamp >= lastClaim + CLAIM_INTERVAL,
            "Claim not available yet"
        );
        // Update last claim time for the claimant
        lastClaimTime[claimant][token] = block.timestamp;
		 // Update total claimed amounts
    if (msg.sender == governanceAddress) {
        totalClaimedByGovernance[claimant] += rewardAmount;
    } else {
        totalClaimedByUser[claimant] += rewardAmount;
    }
        // Transfer reward tokens to claimant
        IERC20(token).safeTransfer(claimant, rewardAmount);
        // Emit event for reward distribution
        emit RewardDistributed(claimant, rewardAmount);
    }
	function getSwapInfoKey(
    address user,
    address inputToken,
    address _stateToken,
    uint256 cycle
) internal pure returns (bytes32) {
    return keccak256(abi.encodePacked(user, inputToken, _stateToken, cycle));
}

    /**
     * @notice Handles token swaps during normal and reverse auctions.
     * During reverse auctions, users burn `stateToken` to receive `inputToken`.
     * This contract must hold sufficient `inputToken` to support those swaps.
     * Liquidity is provided through token contract deployments and manual deposits via depositTokens to ensure the integrity of the liquidity pool ratio..
     */
	 // No explicit limit on burn amount to allow full flexibility in auction finalization.
	// Large burns may risk higher gas usage but are necessary to prevent partial burns locking user funds.
	// Users and integrators should be aware of gas implications when submitting very large burns.
    function swapTokens(address user, address inputToken) public nonReentrant whenNotPaused{
        require(msg.sender == user, "Unauthorized swap initiator");
		require(user != address(0), "Sender cannot be null");
        require(supportedTokens[inputToken], "Unsupported token");
        require(stateToken != address(0), "State token cannot be null");
     	require(getDavBalance(user) >= MIN_DAV_REQUIRED, "RSA: Insufficient DAV");
        uint256 currentAuctionCycle = getCurrentAuctionCycle(inputToken);
        require(currentAuctionCycle < MAX_AUCTIONS, "Maximum auctions reached");

       bytes32 key = getSwapInfoKey(user, inputToken, stateToken, currentAuctionCycle);
		UserSwapInfo storage userSwapInfo = userSwapTotalInfo[key];
        userSwapInfo.cycle = currentAuctionCycle;

        bool isReverseActive = isReverseAuctionActive(inputToken);
        if (isReverseActive) {
            require(isReverseActive, "No active reverse auction for this pair");
            require(
                !userSwapInfo.hasReverseSwap,
                "User already swapped in reverse auction for this cycle"
            );
        } else {
            require(
                isAuctionActive(inputToken),
                "No active auction for this pair"
            );
            require(
                !userSwapInfo.hasSwapped,
                "User already swapped in normal auction for this cycle"
            );
        }
        address tokenIn = isReverseActive ? stateToken : inputToken;
        address tokenOut = isReverseActive ? inputToken : stateToken;
        uint256 TotalAmountIn = calculateAuctionEligibleAmount(inputToken);
        uint256 TotalAmountOut = getOutPutAmount(inputToken);
        uint256 amountIn = isReverseActive ? TotalAmountOut : TotalAmountIn;
        uint256 amountOut = isReverseActive ? TotalAmountIn : TotalAmountOut;
        require(
            amountIn > 0,
           "RSA: Insufficient calculated input amount"
        );
        require(amountOut > 0, "Output amount must be greater than zero");
        /** @dev This check ensures that internal token tracking is aligned with actual contract holdings.
         *Tokens in the Swap contract will be sufficient as the airdrop is limited to 10% of the supply, leaving a large amount of tokens in the swap contract.
         *  Especially important for auction logic or any logic that sends tokens out.*/
        //placed correctly require statments before if-else condition
        require(
            IERC20(tokenOut).balanceOf(address(this)) >= amountOut,
            "Insufficient tokens in vault for the output token"
        );
        if (isReverseActive) {
            userSwapInfo.hasReverseSwap = true;
            TotalBurnedStates += amountIn;
            TotalTokensBurned[tokenIn] += amountIn;
            TotalStateBurnedByUser[user] += amountIn;
			/**
 * @dev We intentionally do not cap the `amountIn` in `swapTokens` to allow for large token burns
 *      when needed for auction finalization or high-volume swaps. While this introduces a potential
 *      risk of transaction failure due to exceeding block gas limits (CWE-400), we mitigate this by:
 *      This design prioritizes flexibility for power users and trust-minimized automation, while
 *      placing the responsibility of gas efficiency on the calling logic.
 * @dev No cap on amountIn for flexibility in auction finalization.
 */
            IERC20(tokenIn).safeTransferFrom(user, BURN_ADDRESS, amountIn);
            IERC20(tokenOut).safeTransfer(user, amountOut);
        } else {
			// Mark normal swap done
            userSwapInfo.hasSwapped = true;
            TotalTokensBurned[tokenIn] += amountIn;
            IERC20(tokenIn).safeTransferFrom(user, BURN_ADDRESS, amountIn);
            IERC20(tokenOut).safeTransfer(user, amountOut);
        }
        emit TokensSwapped(user, tokenIn, tokenOut, amountIn, amountOut);
    }
    function setTokenAddress(
        address _state,
        address _dav
    ) external onlyGovernance {
        require(stateToken == address(0), "State token already set");
        require(dav == DAV_V2_2(payable(address(0))), "DAV already set");
        require(_state != address(0), "Invalid state address");
        require(_dav != address(0), "Invalid dav address");
        supportedTokens[_state] = true;
        supportedTokens[_dav] = true;
        dav = DAV_V2_2(payable(_dav));
        stateToken = _state;
    }

    function getUserHasSwapped(
        address user,
        address inputToken
    ) public view returns (bool) {
        uint256 getCycle = getCurrentAuctionCycle(inputToken);
		bytes32 key = getSwapInfoKey(user, inputToken, stateToken, getCycle);
    	return userSwapTotalInfo[key].hasSwapped;
    }

    function getUserHasReverseSwapped(
        address user,
        address inputToken
    ) public view returns (bool) {
        uint256 getCycle = getCurrentAuctionCycle(inputToken);
        bytes32 key = getSwapInfoKey(user, inputToken, stateToken, getCycle);
    	return userSwapTotalInfo[key].hasReverseSwap;
    }

    /// @notice Returns auction cycle data for a given input token
    /// @dev Caches auctionCycles[inputToken][stateToken] in memory to reduce SLOAD gas costs
    /// @param inputToken The ERC20 token address being auctioned
    /// @return initialized Whether the auction cycle has started
    /// @return currentTime Current block timestamp
    /// @return fullCycleLength Sum of auction duration and interval
    /// @return firstAuctionStart Timestamp of the first auction start
    /// @return cycleNumber Which auction cycle we're in
    /// @return isValidCycle Whether the current cycle is active and valid
    function _getAuctionCycleData(
        address inputToken
    )
        internal
        view
        returns (
            bool initialized,
            uint256 currentTime,
            uint256 fullCycleLength,
            uint256 firstAuctionStart,
            uint256 cycleNumber,
            bool isValidCycle
        )
    {
        AuctionCycle memory cycle = auctionCycles[inputToken][stateToken];
        initialized = cycle.isInitialized;
        firstAuctionStart = cycle.firstAuctionStart;
        currentTime = block.timestamp;
        fullCycleLength = AUCTION_DURATION + AUCTION_INTERVAL;
        if (!initialized || currentTime < firstAuctionStart) {
            isValidCycle = false;
            return (
                initialized,
                currentTime,
                fullCycleLength,
                firstAuctionStart,
                0,
                isValidCycle
            );
        }
        uint256 timeSinceStart = currentTime - firstAuctionStart;
        cycleNumber = timeSinceStart / fullCycleLength;
        isValidCycle = cycleNumber < MAX_AUCTIONS;
    }

    function isAuctionActive(address inputToken) public view returns (bool) {
        require(supportedTokens[inputToken], "Unsupported token");
        (
            bool initialized,
            uint256 currentTime,
            uint256 fullCycleLength,
            uint256 firstAuctionStart,
            uint256 cycleNumber,
            bool isValidCycle
        ) = _getAuctionCycleData(inputToken);

        if (!initialized || !isValidCycle) return false;
        // Skip every 4th cycle (4,8,12...)
        bool isFourthCycle = ((cycleNumber + 1) % 4 == 0);
        if (isFourthCycle) return false;
        uint256 currentCycleStart = firstAuctionStart +
            cycleNumber *
            fullCycleLength;
        uint256 auctionEndTime = currentCycleStart + AUCTION_DURATION;
        return currentTime >= currentCycleStart && currentTime < auctionEndTime;
    }

    function isReverseAuctionActive(
        address inputToken
    ) public view returns (bool) {
        require(supportedTokens[inputToken], "Unsupported token");
        (
            bool initialized,
            uint256 currentTime,
            uint256 fullCycleLength,
            uint256 firstAuctionStart,
            uint256 cycleNumber,
            bool isValidCycle
        ) = _getAuctionCycleData(inputToken);
        if (!initialized || !isValidCycle) return false;
        // Only every 4th cycle (4,8,12...) is reverse auction
        bool isFourthCycle = ((cycleNumber + 1) % 4 == 0);
        if (!isFourthCycle) return false;
        uint256 currentCycleStart = firstAuctionStart +
            cycleNumber *
            fullCycleLength;
        uint256 auctionEndTime = currentCycleStart + AUCTION_DURATION;
        return currentTime >= currentCycleStart && currentTime < auctionEndTime;
    }
    function getCurrentAuctionCycle(
        address inputToken
    ) public view returns (uint256) {
        AuctionCycle memory cycle = auctionCycles[inputToken][stateToken];
        if (!cycle.isInitialized) return 0;
        uint256 fullCycleLength = AUCTION_DURATION + AUCTION_INTERVAL;
        uint256 currentTime = block.timestamp;
        // If auction hasn't started yet, cycle is 0
        if (currentTime < cycle.firstAuctionStart) return 0;
        uint256 timeSinceStart = currentTime - cycle.firstAuctionStart;
        uint256 cycleNumber = timeSinceStart / fullCycleLength;
        if (cycleNumber >= MAX_AUCTIONS) {
            return MAX_AUCTIONS;
        }
        return cycleNumber;
    }

    function getAuctionTimeLeft(
        address inputToken
    ) public view returns (uint256) {
        require(supportedTokens[inputToken], "Unsupported token");
        AuctionCycle memory cycle = auctionCycles[inputToken][stateToken];
        if (!cycle.isInitialized) return 0;
        uint256 fullCycleLength = AUCTION_DURATION + AUCTION_INTERVAL;
        uint256 currentTime = block.timestamp;
        uint256 timeSinceStart = currentTime - cycle.firstAuctionStart;
        uint256 cycleNumber = timeSinceStart / fullCycleLength;
        if (cycleNumber >= MAX_AUCTIONS) return 0;
        uint256 currentCycleStart = cycle.firstAuctionStart +
            cycleNumber *
            fullCycleLength;
        uint256 auctionEndTime = currentCycleStart + AUCTION_DURATION;
        if (currentTime >= currentCycleStart && currentTime < auctionEndTime) {
            return auctionEndTime - currentTime;
        }
        return 0;
    }
    // No need of use safeMath as solidity new versions are taking care of that

    function calculateAuctionEligibleAmount(
        address inputToken
    ) public view returns (uint256) {
        require(supportedTokens[inputToken], "Unsupported token");
        uint256 currentCycle = getCurrentAuctionCycle(inputToken);
        if (currentCycle >= MAX_AUCTIONS) {
            return 0;
        }
        uint256 davbalance = getDavBalance(msg.sender);
        if (davbalance == 0) {
            return 0;
        }
        bool isReverse = isReverseAuctionActive(inputToken);
        // Adjust calculation to avoid truncation
        uint256 firstCal = (MAX_SUPPLY * percentage * PRECISION_FACTOR) / 100;
        uint256 secondCalWithDavMax = (firstCal / DAV_FACTOR) * davbalance;
        uint256 baseAmount = isReverse
            ? secondCalWithDavMax * 2
            : secondCalWithDavMax;

        return baseAmount / PRECISION_FACTOR; // Scale back to correct units
    }

    function getOutPutAmount(address inputToken) public view returns (uint256) {
        require(supportedTokens[inputToken], "Unsupported token");
        uint256 currentRatio = getRatioPrice(inputToken);
        require(currentRatio > 0, "Invalid ratio");

        uint256 userBalance = getDavBalance(msg.sender);
        if (userBalance == 0) {
            return 0;
        }

        bool isReverseActive = isReverseAuctionActive(inputToken);
        uint256 onePercent = calculateAuctionEligibleAmount(inputToken);
        require(onePercent > 0, "Invalid one percent balance");
        uint256 multiplications;
        if (isReverseActive) {
			// multiply with 1e18 on mainnet
        multiplications = (onePercent * currentRatio) / (2 * PRECISION_FACTOR);
        } else {
        multiplications = (onePercent * currentRatio * 2) / PRECISION_FACTOR;
        }
        return multiplications;
	}
    //Airdrop getter functions
    function getClaimableReward(
        address user,
        address inputToken
    ) public view returns (uint256) {
        require(user != address(0), "Invalid user address");
        uint256 currentDavHolding = getDavBalance(user);
        uint256 lastHolding = lastDavHolding[user][inputToken];
        uint256 newDavContributed = currentDavHolding > lastHolding
            ? currentDavHolding - lastHolding
            : 0;
        // Calculate reward as in distributeReward
        uint256 reward = (newDavContributed * AIRDROP_AMOUNT) /
            PRECISION_FACTOR;
        return reward;
    }
    function getNextClaimTime(
        address token
    ) public view returns (uint256 timeLeftInSeconds) {
        address owner = tokenOwners[token];
        require(owner != address(0), "Token has no registered owner");
        address claimant = msg.sender == governanceAddress ? DevAddress : owner;
        uint256 lastClaim = lastClaimTime[claimant][token];
        if (block.timestamp >= lastClaim + CLAIM_INTERVAL) {
            return 0;
        } else {
            return (lastClaim + CLAIM_INTERVAL) - block.timestamp;
        }
    }
    function hasAirdroppedClaim(
        address user,
        address inputToken
    ) public view returns (bool) {
        require(user != address(0), "Invalid user address");
        uint256 currentDavHolding = getDavBalance(user);
        uint256 lastHolding = lastDavHolding[user][inputToken];
        // If user has claimed and no new DAV is added, return true
        if (hasClaimed[user][inputToken] && currentDavHolding <= lastHolding) {
            return true;
        }
        // Otherwise, either they haven't claimed, or they have new DAV, so return false
        return false;
    }
    //burned getter
    function getTotalStateBurned() public view returns (uint256) {
        return TotalBurnedStates;
    }

    function getTotalStateBurnedByUser(
        address user
    ) public view returns (uint256) {
        return TotalStateBurnedByUser[user];
    }

    function getTotalTokensBurned(
        address inputToken
    ) public view returns (uint256) {
        return TotalTokensBurned[inputToken];
    }

    // Getter for deployed token by name
/// @notice Returns the full list of token names owned by the governance address.
/// @dev This function intentionally returns the entire `userToTokenNames` array for the governance address.
///      Pagination is not implemented because:
///      - The DApp requires full data for display purposes (e.g., dropdowns, dashboards).
///      - Token creation is strictly controlled, and the protocol limits users to MAX_USER (15,000),
///        ensuring the array size stays within safe gas limits.
///      - This function is `view` only, with no on-chain gas cost unless called via another contract.
///      The gas usage is an acceptable trade-off for improved frontend simplicity and developer experience.
function getUserTokenNames() external view returns (string[] memory) {
    return userToTokenNames[governanceAddress];
}
function getDavBalance(address user) internal view returns (uint256) {
	//check for dav contract is deployed and added or not
	require(address(dav).code.length > 0, "DAV contract not deployed");
	  if (user == governanceAddress) {
        return dav.balanceOf(user);
    }
    try dav.getActiveBalance(user) returns (uint256 balance) {
        return balance;
    } catch {
        return dav.balanceOf(user);
    }
}
    function getUserTokenAddress(
        string memory name
    ) external view returns (address) {
        return deployedTokensByUser[governanceAddress][name];
    }
    function getTokenOwner(address token) public view returns (address) {
        return tokenOwners[token];
    }
/**
 * @notice Returns the full list of token entries owned by a specified address.
 * @dev This function returns all token entries stored in `userTokenEntries` for the given owner.
 *      It is designed to meet the DApp's requirement to display all token details (name, emoji/image,
 *      and status) at once without pagination or limits. The protocol limits the number of users to
 *      MAX_USER (10,000) and enforces a maximum number of tokens per user, ensuring the array size
 *      remains manageable and gas costs are within acceptable bounds. We avoid pagination to maintain
 *      simple, clear logic and align with the DApp's need for complete data retrieval in a single call.
 *      The gas cost is acknowledged as a trade-off for usability, and the function is optimized for
 *      view-only access to minimize on-chain impact.
 * @return An array of TokenEntry structs containing token details for the specified owner.
 */
    function getTokensByOwner(
        address _owner
    ) public view returns (address[] memory) {
        return ownerToTokens[_owner];
    }

    function isTokenRenounced(
        address tokenAddress
    ) external view returns (bool) {
        return Ownable(tokenAddress).owner() == address(0);
    }

    function isTokenSupported(address token) public view returns (bool) {
        return supportedTokens[token];
    }
}
