// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AuctionRatioSwapping {
    address public admin;
    uint256 public auctionInterval = 120 minutes;
    uint256 public auctionDuration = 20 minutes;

    bool public isPaused = false;
    bool public isStopped = false;
    address stateToken;

    struct Vault {
        uint256 totalDeposited;
        uint256 totalAuctioned;
    }
    struct Auction {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address tokenIn;
        address tokenOut;
    }

    struct UserSwap {
        uint256 totalSwapped;
        mapping(address => uint256) tokenSwapped; // Track amounts per token
    }

    mapping(address => Vault) public vaults;
    mapping(address => bool) public supportedTokens;
    mapping(address => UserSwap) public userSwaps;
    mapping(address => uint256) public totalBurnedTokens;
    mapping(address => mapping(address => uint256)) public lastAuctionTime;
    mapping(address => mapping(address => uint256)) public RatioTarget;
    mapping(address => mapping(address => uint256)) public CurrentRatio;
    mapping(address => mapping(address => bool)) public isTerminated;
    mapping(address => mapping(address => bool)) public approvals;

    Auction[] public currentAuctions;
    address[][] public auctionPairs; // List of token pairs for auctions

    event AuctionStarted(
        uint256 startTime,
        uint256 endTime,
        address tokenIn,
        address tokenOut
    );
    // Event for tracking approvals
    event ApprovalForSwap(
        address indexed owner,
        address indexed spender,
        bool status
    );

    event PairRemoved(address tokenIn, address tokenOut);
    event AuctionTerminated(address tokenIn, address tokenOut);

    event PairAdded(address tokenIn, address tokenOut);
    event TokensDeposited(address indexed token, uint256 amount);
    event AuctionStarted(
        uint256 startTime,
        uint256 endTime,
        address tokenIn,
        address tokenOut,
        uint256 collectionPercentage
    );
    event TokensSwapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    event TokensBurned(address indexed token, uint256 amountBurned);
    event ContractPaused(bool isPaused);
    event ContractStopped(bool isStopped);
    event AuctionIntervalUpdated(uint256 newInterval);

    modifier onlyAdmin() {
        require(
            msg.sender == governanceAddress,
            "Only admin can perform this action"
        );
        _;
    }

    modifier notPausedOrStopped() {
        require(!isPaused, "Contract is paused");
        require(!isStopped, "Contract is stopped");
        _;
    }

    constructor(address state) {
        governanceAddress = msg.sender;
        stateToken = state;
    }

    address private governanceAddress;
    event GovernanceChanged(
        address indexed oldGovernance,
        address indexed newGovernance
    );
    event RewardDistributed(address indexed user, uint256 amount);

    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "Swapping: You are not authorized to perform this action"
        );
        _;
    }

    function setGovernanceAddress(address _newGovernance)
        external
        onlyGovernance
    {
        require(
            _newGovernance != address(0),
            "New governance address cannot be zero"
        );
        governanceAddress = _newGovernance;
        emit GovernanceChanged(governanceAddress, _newGovernance);
    }

    function depositTokens(address token, uint256 amount) external onlyAdmin {
        require(supportedTokens[token], "Unsupported token");

        Vault storage vault = vaults[token];
        vault.totalDeposited += amount;

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        emit TokensDeposited(token, amount);
    }

    function setAuctionInterval(uint256 _newInterval) external onlyAdmin {
        require(_newInterval > 0, "Interval must be greater than 0");
        auctionInterval = _newInterval;
        emit AuctionIntervalUpdated(_newInterval);
    }

    struct AuctionPairStatus {
        uint256 lastAuctionEndTime; // Track when the last auction ended
        bool isCurrentlyActive; // Is there an active auction for this pair
        uint256 currentAuctionIndex; // Index in currentAuctions array if active
    }
    struct AuctionCycle {
        uint256 firstAuctionStart; // Timestamp when the first auction started
        bool isInitialized; // Whether this pair has been initialized
        address tokenIn;
        address tokenOut;
    }
    mapping(address => mapping(address => AuctionCycle)) public auctionCycles;

    mapping(address => mapping(address => AuctionPairStatus)) public pairStatus;

    mapping(address => mapping(address => bool)) public processedPairs;

    function isAuctionActive(address tokenIn, address tokenOut)
        public
        view
        returns (bool)
    {
        AuctionCycle memory cycle = auctionCycles[tokenIn][tokenOut];

        if (!cycle.isInitialized) {
            return false;
        }

        uint256 currentTime = block.timestamp;
        uint256 timeSinceStart = currentTime - cycle.firstAuctionStart;
        uint256 fullCycleLength = auctionDuration + auctionInterval;

        // If we're in a cycle, find where we are in it
        if (timeSinceStart > 0) {
            uint256 currentCyclePosition = timeSinceStart % fullCycleLength;
            return currentCyclePosition < auctionDuration;
        }

        return false;
    }

    function terminateAuctionPair(address tokenIn, address tokenOut)
        public
        onlyAdmin
    {
        require(
            supportedTokens[tokenIn] && supportedTokens[tokenOut],
            "Unsupported tokens"
        );
        require(!isTerminated[tokenIn][tokenOut], "Pair already terminated");

        // Mark both directions as terminated
        isTerminated[tokenIn][tokenOut] = true;
        isTerminated[tokenOut][tokenIn] = true;

        // Clear the auction cycle
        delete auctionCycles[tokenIn][tokenOut];
        delete auctionCycles[tokenOut][tokenIn];

        emit AuctionTerminated(tokenIn, tokenOut);
        emit AuctionTerminated(tokenOut, tokenIn);
    }

    // Function to get the next auction start time for a pair
    function getNextAuctionStart(address tokenIn, address tokenOut)
        public
        view
        returns (uint256)
    {
        AuctionCycle memory cycle = auctionCycles[tokenIn][tokenOut];

        if (!cycle.isInitialized) {
            return 0;
        }

        uint256 currentTime = block.timestamp;
        uint256 timeSinceStart = currentTime - cycle.firstAuctionStart;
        uint256 fullCycleLength = auctionDuration + auctionInterval;

        uint256 currentCycleNumber = timeSinceStart / fullCycleLength;
        uint256 nextCycleStart = cycle.firstAuctionStart +
            (currentCycleNumber + 1) *
            fullCycleLength;

        return nextCycleStart;
    }

    function startAuction() public onlyAdmin {
        require(auctionPairs.length > 0, "No auction pairs available");
        uint256 currentTime = block.timestamp;

        for (uint256 i = 0; i < auctionPairs.length; i++) {
            address tokenIn = auctionPairs[i][0];
            address tokenOut = auctionPairs[i][1];

            // Only initialize if not already initialized
            if (!auctionCycles[tokenIn][tokenOut].isInitialized) {
                auctionCycles[tokenIn][tokenOut] = AuctionCycle({
                    firstAuctionStart: currentTime,
                    isInitialized: true,
                    tokenIn: tokenIn,
                    tokenOut: tokenOut
                });

                // Also initialize reverse pair
                auctionCycles[tokenOut][tokenIn] = AuctionCycle({
                    firstAuctionStart: currentTime,
                    isInitialized: true,
                    tokenIn: tokenOut,
                    tokenOut: tokenIn
                });

                emit AuctionStarted(
                    currentTime,
                    currentTime + auctionDuration,
                    tokenIn,
                    tokenOut
                );
            }
        }
    }

    function swapTokens(
        address tokenIn,
        uint256 amountOut,
        uint256 amountIn
    ) external notPausedOrStopped {
        address tokenOut = stateToken;
        require(tokenOut != address(0), "state token can not be null");
        require(
            supportedTokens[tokenIn] && supportedTokens[tokenOut],
            "Unsupported tokens"
        );
        require(msg.sender != address(0), "Sender cannot be null");
        require(tokenIn != tokenOut, "Input and output tokens must differ");
        require(amountOut > 0, "Output amount must be greater than zero");
        require(
            isAuctionActive(tokenIn, tokenOut),
            "No active auction for this pair"
        );

        if (amountIn == 0) {
            amountIn = 1;
        }
        if (amountOut == 0) {
            amountOut = 1;
        }

        address spender = msg.sender;
        if (msg.sender != tx.origin) {
            require(approvals[tx.origin][msg.sender], "Caller not approved");
            spender = tx.origin;
        }
        // Check if currentRatio reached or exceeded the ratioTarget for the pair
        uint256 currentRatio = CurrentRatio[tokenIn][tokenOut];
        uint256 ratioTarget = RatioTarget[tokenIn][tokenOut];

        uint256 reverseCurrentRatio = CurrentRatio[tokenOut][tokenIn];
        uint256 reverseRatioTarget = RatioTarget[tokenOut][tokenIn];

        // If currentRatio >= ratioTarget, apply reverse swap logic

        bool reverseSwap = (currentRatio >= ratioTarget) ||
            (reverseCurrentRatio >= reverseRatioTarget);
        if (reverseSwap) {
            // Reverse swap logic: Swap tokenOut for tokenIn
            (tokenIn, tokenOut) = (tokenOut, tokenIn);
            uint256 temp = amountIn;
            amountIn = amountOut;
            amountOut = temp;
        }

        // Process the swap
        Vault storage vaultOut = vaults[tokenOut];
        require(
            vaultOut.totalDeposited >= vaultOut.totalAuctioned + amountOut,
            "Insufficient tokenOut in vault"
        );

        vaultOut.totalAuctioned += amountOut;

        UserSwap storage userSwap = userSwaps[spender];
        userSwap.totalSwapped += amountIn;
        userSwap.tokenSwapped[tokenIn] += amountIn;

        // Transfer tokens
        IERC20(tokenIn).transferFrom(spender, address(this), amountIn);
        IERC20(tokenOut).transfer(spender, amountOut);

        emit TokensSwapped(spender, tokenIn, tokenOut, amountIn, amountOut);
    }

    function addAuctionPair(
        address tokenIn,
        address tokenOut,
        uint256 _CurrentRatio
    ) external onlyAdmin {
        require(
            tokenIn != address(0) && tokenOut != address(0),
            "Invalid token pair"
        );
        require(tokenIn != tokenOut, "Tokens must be different");

        // Add the new pair (tokenIn, tokenOut)
        auctionPairs.push([tokenIn, tokenOut]);
        supportedTokens[tokenIn] = true;
        supportedTokens[tokenOut] = true;

        RatioTarget[tokenIn][tokenOut] = 0;
        CurrentRatio[tokenIn][tokenOut] = _CurrentRatio;

        // Add the reverse pair (tokenOut, tokenIn)
        auctionPairs.push([tokenOut, tokenIn]);
        RatioTarget[tokenOut][tokenIn] = 0; // Default ratio target
        CurrentRatio[tokenOut][tokenIn] = _CurrentRatio;

        // Start auctions for both pairs
        startAuction();

        emit PairAdded(tokenIn, tokenOut);
        emit PairAdded(tokenOut, tokenIn);
    }

    function startSingleAuction(
        address tokenIn,
        address tokenOut,
        uint256 collectionPercentage
    ) external onlyGovernance {
        require(
            supportedTokens[tokenIn] && supportedTokens[tokenOut],
            "Unsupported tokens"
        );
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + auctionDuration;

        currentAuctions.push(
            Auction({
                startTime: startTime,
                endTime: endTime,
                isActive: true,
                tokenIn: tokenIn,
                tokenOut: tokenOut
            })
        );

        emit AuctionStarted(
            startTime,
            endTime,
            tokenIn,
            tokenOut,
            collectionPercentage
        );
    }

    function setRatioTarget(
        address tokenIn,
        address tokenOut,
        uint256 ratioTarget
    ) external onlyAdmin {
        require(ratioTarget > 0, "Target ratio must be greater than zero");

        require(CurrentRatio[tokenIn][tokenOut] != 0, "Pair not initialized");

        RatioTarget[tokenIn][tokenOut] = ratioTarget;
        RatioTarget[tokenOut][tokenIn] = ratioTarget;
    }

    // Function to approve another user
    function approveSwap(address approved, bool status) external {
        approvals[msg.sender][approved] = status;
        emit ApprovalForSwap(msg.sender, approved, status);
    }

    function endAuction(uint256 auctionIndex, bool forceEnd)
        external
        onlyAdmin
    {
        require(auctionIndex < currentAuctions.length, "Invalid auction index");

        // Check if the auction is already inactive
        require(
            currentAuctions[auctionIndex].isActive,
            "Auction is not active"
        );

        // Allow force end or check if the auction's endTime has passed
        if (!forceEnd) {
            require(
                block.timestamp > currentAuctions[auctionIndex].endTime,
                "Auction is still active"
            );
        }

        // End the auction
        currentAuctions[auctionIndex].isActive = false;
    }

    function setAuctionDuration(uint256 _auctionDuration) external onlyAdmin {
        require(
            _auctionDuration > 0,
            "Auction duration must be greater than 0"
        );
        auctionDuration = _auctionDuration;
    }

    function removePair(address tokenIn, address tokenOut) external onlyAdmin {
        require(
            supportedTokens[tokenIn] && supportedTokens[tokenOut],
            "Unsupported tokens"
        );

        // First terminate the auction if not already terminated
        if (!isTerminated[tokenIn][tokenOut]) {
            terminateAuctionPair(tokenIn, tokenOut);
        }

        // Remove pairs from auctionPairs array
        for (uint256 i = 0; i < auctionPairs.length; i++) {
            if (
                (auctionPairs[i][0] == tokenIn &&
                    auctionPairs[i][1] == tokenOut) ||
                (auctionPairs[i][0] == tokenOut &&
                    auctionPairs[i][1] == tokenIn)
            ) {
                // Replace with last element and pop
                auctionPairs[i] = auctionPairs[auctionPairs.length - 1];
                auctionPairs.pop();
                // Adjust index to check the swapped element
                i--;
            }
        }

        // Check if tokens are used in other pairs before removing support
        bool tokenInUsed = false;
        bool tokenOutUsed = false;

        for (uint256 i = 0; i < auctionPairs.length; i++) {
            if (
                auctionPairs[i][0] == tokenIn || auctionPairs[i][1] == tokenIn
            ) {
                tokenInUsed = true;
            }
            if (
                auctionPairs[i][0] == tokenOut || auctionPairs[i][1] == tokenOut
            ) {
                tokenOutUsed = true;
            }
        }

        // Remove token support if not used in other pairs
        if (!tokenInUsed) {
            supportedTokens[tokenIn] = false;
        }
        if (!tokenOutUsed) {
            supportedTokens[tokenOut] = false;
        }

        // Clean up related mappings
        delete RatioTarget[tokenIn][tokenOut];
        delete RatioTarget[tokenOut][tokenIn];
        delete isTerminated[tokenIn][tokenOut];
        delete isTerminated[tokenOut][tokenIn];

        emit PairRemoved(tokenIn, tokenOut);
        emit PairRemoved(tokenOut, tokenIn);
    }

    function pauseContract(bool _pause) external onlyAdmin {
        isPaused = _pause;
        emit ContractPaused(_pause);
    }

    function stopContract(bool _stop) external onlyAdmin {
        isStopped = _stop;
        emit ContractStopped(_stop);
    }

    function addSupportedToken(address token) external onlyAdmin {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyAdmin {
        supportedTokens[token] = false;
    }

    function getUserSwappedAmount(address user, address token)
        external
        view
        returns (uint256)
    {
        return userSwaps[user].tokenSwapped[token];
    }
}
