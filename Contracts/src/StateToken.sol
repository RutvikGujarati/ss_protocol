// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {DAVToken} from "./DavToken.sol";

contract StateToken is ERC20, Ownable(msg.sender), ReentrancyGuard {
    DAVToken public davToken;

    uint256 public MAX_SUPPLY = 999000000000000 ether;
    uint256 public REWARD_DECAY_START = 1735284528 ; // Timestamp for 01/01/2025
    uint256 public DECAY_INTERVAL = 1 minutes;
    uint256 public constant DECAY_STEP = 1; // 1% per interval
    uint256 private constant PRECISION = 1e18;

    mapping(address => uint256) public userBaseReward;
    mapping(address => uint256) public userRewardAmount;
    mapping(address => uint256) public lastDavMintTime;
    mapping(address => uint256) public lastDavHolding;
    mapping(address => uint256) public mintDecayPercentage;
    mapping(address => uint256) public cumulativeMintableHoldings;

    address private governanceAddress;

    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "StateToken: You are not authorized to perform this action"
        );
        _;
    }

    constructor(
        address _davTokenAddress,
        string memory name,
        string memory symbol,
        address Governance
    ) ERC20(name, symbol) {
        require(
            _davTokenAddress != address(0),
            "StateToken: Invalid DAV token address"
        );
        require(
            Governance != address(0),
            "StateToken: Governance address cannot be zero"
        );

        davToken = DAVToken(payable(_davTokenAddress));
        governanceAddress = Governance;
    }

    /**
     * @dev Change MAX_SUPPLY, restricted to governance.
     */
    function changeMAXSupply(uint256 newMaxSupply) external onlyGovernance {
        require(
            newMaxSupply <= MAX_SUPPLY,
            "StateToken: Max supply exceeds limit"
        );
        MAX_SUPPLY = newMaxSupply;
    }

    function changeTimeStamp(uint256 newTimeStamp) external onlyGovernance {
        require(
            newTimeStamp > block.timestamp,
            "StateToken: New timestamp must be in the future"
        );
        require(
            newTimeStamp != REWARD_DECAY_START,
            "StateToken: New timestamp must be different from the current"
        );
        REWARD_DECAY_START = newTimeStamp;
    }

    function changeInterval(uint256 newInterval) external onlyGovernance {
        require(
            newInterval > 0,
            "StateToken: Interval must be greater than zero"
        );
        require(
            newInterval != DECAY_INTERVAL,
            "StateToken: New interval must be different from the current"
        );
        DECAY_INTERVAL = newInterval;
    }

    function changeDavToken(address newDav) external onlyGovernance {
        require(newDav != address(0), "StateToken: Invalid DAV token address");
        require(
            newDav != address(davToken),
            "StateToken: New DAV token must be different from the current"
        );
        davToken = DAVToken(payable(newDav));
    }

    /**
     * @dev Calculate decayed reward based on decay percentage.
     */
    function calculateDecayedReward(uint256 baseReward, uint256 decayPercent)
        public
        pure
        returns (uint256)
    {
        if (decayPercent >= 100) {
            return 0;
        }
        uint256 decayFactor = 100 * PRECISION - (decayPercent * PRECISION);
        return (baseReward * decayFactor) / (100 * PRECISION);
    }

    /**
     * @dev Distribute reward for a user's DAV holdings.
     */
    function distributeReward(address user) external nonReentrant {
        // **Checks**
        require(user != address(0), "StateToken: Invalid user address");

        uint256 currentDavHolding = davToken.balanceOf(user);
        uint256 lastHolding = lastDavHolding[user];
        require(
            currentDavHolding > lastHolding,
            "StateToken: No new DAV minted"
        );

        uint256 newDavMinted = currentDavHolding - lastHolding;
        uint256 mintTimestamp = davToken.viewLastMintTimeStamp(user);

        // **Effects**
        uint256 decayAtMint = getDecayPercentageAtTime(mintTimestamp);
        uint256 baseReward = calculateBaseReward(newDavMinted);
        uint256 decayedReward = calculateDecayedReward(baseReward, decayAtMint);

        userBaseReward[user] = baseReward;
        userRewardAmount[user] += decayedReward;
        cumulativeMintableHoldings[user] += newDavMinted;

        lastDavHolding[user] = currentDavHolding;
        lastDavMintTime[user] = mintTimestamp;
        mintDecayPercentage[user] = decayAtMint;

        // **No Interactions**
    }

    function mintReward() external nonReentrant {
        // **Checks**
        uint256 reward = userRewardAmount[msg.sender];
        require(reward > 0, "StateToken: No reward to mint");

        uint256 mintableHoldings = cumulativeMintableHoldings[msg.sender];
        require(
            mintableHoldings > 0,
            "StateToken: No new holdings to calculate minting"
        );

        uint256 amountToMint = ((1000000000 * 1e18) * mintableHoldings) /
            (10**decimals());
        require(
            totalSupply() + reward + amountToMint <= MAX_SUPPLY,
            "StateToken: Max supply exceeded"
        );

        // **Effects**
        userRewardAmount[msg.sender] = 0;
        cumulativeMintableHoldings[msg.sender] = 0;

        // **Interactions**
        _mint(msg.sender, reward);
        _mint(address(this), amountToMint);
    }

    /**
     * @dev Calculate the base reward for a given DAV amount.
     */
    function calculateBaseReward(uint256 davAmount)
        public
        view
        returns (uint256)
    {
        uint256 scaled = davAmount / 5000000;
        return ((scaled * (MAX_SUPPLY * 10)) / 1000) / 1e18;
    }

    /**
     * @dev Get the decay percentage at a specific timestamp.
     */
    function getDecayPercentageAtTime(uint256 timestamp)
        public
        view
        returns (uint256)
    {
        if (timestamp < REWARD_DECAY_START) return 0;

        uint256 elapsed = timestamp - REWARD_DECAY_START;
        uint256 decayIntervals = elapsed / DECAY_INTERVAL;
        uint256 totalDecayPercentage = decayIntervals * DECAY_STEP;

        return totalDecayPercentage > 100 ? 100 : totalDecayPercentage;
    }

    /**
     * @dev Get the current decay percentage based on the block timestamp.
     */
    function getCurrentDecayPercentage() public view returns (uint256) {
        return getDecayPercentageAtTime(block.timestamp);
    }

    function transferToken(uint256 amount)
        external
        onlyGovernance
        nonReentrant
    {
        require(amount > 0, "Transfer amount must be greater than zero");
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        require(governanceAddress != address(0), "Invalid governance address");

        _transfer(address(this), governanceAddress, amount);
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
    }

    /**
     * @dev View reward details for a user.
     */
    function viewRewardDetails(address user)
        external
        view
        returns (
            uint256 baseReward,
            uint256 currentReward,
            uint256 lastMintTimestamp,
            uint256 decayAtMint
        )
    {
        baseReward = userBaseReward[user];
        currentReward = userRewardAmount[user];
        lastMintTimestamp = lastDavMintTime[user];
        decayAtMint = mintDecayPercentage[user];
    }
}
