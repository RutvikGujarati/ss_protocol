// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";

contract StateToken is ERC20, Ownable(msg.sender) {
    DAVToken public davToken;

    uint256 public MAX_SUPPLY = 999000000000000 ether;
    uint256 public constant REWARD_DECAY_START = 1735669800; // Timestamp for 01/01/2025
    uint256 public constant DECAY_INTERVAL = 1 days;
    uint256 public constant DECAY_STEP = 1; // 1% per interval
    uint256 private constant PRECISION = 1e18;

    mapping(address => uint256) public userBaseReward; // Store base reward separately
    mapping(address => uint256) public userRewardAmount;
    mapping(address => uint256) public lastDavMintTime;
    mapping(address => uint256) public lastDavHolding;
    mapping(address => uint256) public mintDecayPercentage;
    mapping(address => uint256) public cumulativeMintableHoldings; // New mapping to track mintable holdings separately

    constructor(
        address _davTokenAddress,
        string memory name,
        string memory symbol,
		address Governance,
    ) ERC20(name, symbol) {
        davToken = DAVToken(payable(_davTokenAddress));
		governanceAddress = Governance;
    }

    address private governanceAddress;

    // Modifier to check if the sender is the governance address
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    function changeMX(uint256 amount) external onlyGovernance {
        MAX_SUPPLY = amount;
    }

    function calculateDecayedReward(
        uint256 baseReward,
        uint256 decayPercent
    ) public pure returns (uint256) {
        if (decayPercent >= 100) {
            return 0;
        }
        uint256 decayFactor = 100 * PRECISION - (decayPercent * PRECISION);
        return (baseReward * decayFactor) / (100 * PRECISION);
    }

    function distributeReward(address user) public {
        uint256 currentDavHolding = davToken.balanceOf(user);
        uint256 lastHolding = lastDavHolding[user];

        require(currentDavHolding > lastHolding, "No new DAV minted");

        uint256 newDavMinted = currentDavHolding - lastHolding;
        uint256 mintTimestamp = davToken.viewLastMintTimeStamp(user);

        uint256 decayAtMint = getDecayPercentageAtTime(mintTimestamp);
        uint256 baseReward = calculateBaseReward(newDavMinted);
        uint256 decayedReward = calculateDecayedReward(baseReward, decayAtMint);

        userBaseReward[user] = baseReward;
        userRewardAmount[user] = decayedReward;

        cumulativeMintableHoldings[user] += newDavMinted;

        lastDavHolding[user] = currentDavHolding;
        lastDavMintTime[user] = mintTimestamp;
        mintDecayPercentage[user] = decayAtMint;
    }

    function mintReward() public {
        uint256 reward = userRewardAmount[msg.sender];
        require(reward > 0, "No reward to mint");

        uint256 mintableHoldings = cumulativeMintableHoldings[msg.sender];
        require(mintableHoldings > 0, "No new holdings to calculate minting");

        uint256 amountToMint = ((1000000000 * 1e18) * mintableHoldings) /
            (10 ** decimals());

        _mint(msg.sender, reward);

        _mint(address(this), amountToMint);

        userRewardAmount[msg.sender] = 0;
        cumulativeMintableHoldings[msg.sender] = 0;
    }

    function calculateBaseReward(
        uint256 davAmount
    ) public view returns (uint256) {
        uint256 scaled = davAmount / 5000000;
        return ((scaled * (MAX_SUPPLY * 200)) / 1000) / 1e18;
    }

    function getDecayPercentageAtTime(
        uint256 timestamp
    ) public pure returns (uint256) {
        if (timestamp < REWARD_DECAY_START) return 0;

        uint256 elapsed = timestamp - REWARD_DECAY_START;
        uint256 decayIntervals = elapsed / DECAY_INTERVAL;
        uint256 totalDecayPercentage = decayIntervals * DECAY_STEP;

        return totalDecayPercentage > 100 ? 100 : totalDecayPercentage;
    }

    function getCurrentDecayPercentage() public view returns (uint256) {
        return getDecayPercentageAtTime(block.timestamp);
    }

    function viewRewardDetails(
        address user
    )
        public
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
