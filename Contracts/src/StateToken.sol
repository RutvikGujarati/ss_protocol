// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";

contract StateToken is ERC20, Ownable(msg.sender) {
    DAVToken public davToken;

    uint256 public MAX_SUPPLY = 999000000000000 ether;
    uint256 public constant REWARD_DECAY_START = 1735118930; // Timestamp for 01/01/2025
    uint256 public constant DECAY_INTERVAL = 2 minutes;
    uint256 public constant DECAY_STEP = 1; // 1% per interval
    uint256 private constant PRECISION = 1e18;
    uint256 public constant DAILY_DECAY_PERCENT = 1; // 1% decay per day

    mapping(address => uint256) public userRewardAmount;
    mapping(address => uint256) public lastDavMintTime;
    mapping(address => uint256) public lastDavHolding;
    mapping(address => uint256) public mintDecayPercentage;

    constructor(
        address _davTokenAddress,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        davToken = DAVToken(payable(_davTokenAddress));
    }

    function calculateDecayedReward(
        uint256 baseReward,
        uint256 decayPercent
    ) public pure returns (uint256) {
        if (decayPercent >= 100) {
            return 0;
        }

        uint256 decayFactor = 100 - decayPercent;
        return (baseReward * decayFactor) / 100;
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

        userRewardAmount[user] = decayedReward; // Changed from += to = to prevent accumulation
        lastDavHolding[user] = currentDavHolding;
        lastDavMintTime[user] = mintTimestamp;
        mintDecayPercentage[user] = decayAtMint;
    }

    function mintReward() public {
        uint256 reward = userRewardAmount[msg.sender];
        require(reward > 0, "No reward to mint");

        _mint(msg.sender, reward);
        userRewardAmount[msg.sender] = 0;
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
        uint256 decayMinutes = elapsed / 2 minutes;
        uint256 totalDecayPercentage = decayMinutes * DAILY_DECAY_PERCENT;

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
            uint256 currentReward,
            uint256 decayedReward,
            uint256 lastMintTimestamp,
            uint256 decayAtMint
        )
    {
        uint256 currentDavHolding = davToken.balanceOf(user);
        uint256 lastMintTime = davToken.viewLastMintTimeStamp(user);
        uint256 baseReward = calculateBaseReward(
            currentDavHolding - lastDavHolding[user]
        );

        uint256 decayed = calculateDecayedReward(
            baseReward,
            mintDecayPercentage[user]
        );

        return (
            userRewardAmount[user],
            decayed,
            lastMintTime,
            mintDecayPercentage[user]
        );
    }
}
