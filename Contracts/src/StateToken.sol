// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";

contract RatioSwapToken is ERC20, Ownable(msg.sender) {
    DAVToken public davToken;
    uint256 public constant MAX_SUPPLY = 999000000000000 ether;

    uint256 public constant REWARD_DECAY_START = 1735112059; // Timestamp for 01/01/2025
    uint256 public constant DAILY_DECAY_PERCENT = 1; // 1% per day
    uint256 public constant MAX_DECAY_PERIOD = 100 minutes;

    mapping(address => uint256) public userRewardAmount;
    mapping(address => uint256) public mintedAmount;
    mapping(address => uint256) public lastDavHolding;

    constructor(
        address _davTokenAddress,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        davToken = DAVToken(payable(_davTokenAddress));
    }

    function distributeRewardForUser(address user) public {
        uint256 currentDavHolding = davToken.balanceOf(user);
        require(currentDavHolding > lastDavHolding[user], "No new DAV minted");

        uint256 newDavMinted = currentDavHolding - lastDavHolding[user];
        uint256 lastMintTime = davToken.viewLastMintTimeStamp(user); // Fetch DAV mint timestamp
        uint256 newReward = calculateReward(newDavMinted);

        if (block.timestamp >= REWARD_DECAY_START) {
            uint256 timeElapsed = block.timestamp - lastMintTime;

            // Apply decay only if within the decay period
            if (timeElapsed <= MAX_DECAY_PERIOD) {
                newReward = getCurrentReward(newReward, timeElapsed);
            }
        }

        userRewardAmount[user] += newReward;
        lastDavHolding[user] = currentDavHolding;
    }
    function seetimestampslogs(address user) public view returns (uint256) {
        uint256 reward;
        if (block.timestamp >= REWARD_DECAY_START) {
            uint256 lastMintTime = davToken.viewLastMintTimeStamp(user);
            uint256 currentDavHolding = davToken.balanceOf(user);

            uint256 newDavMinted = currentDavHolding - lastDavHolding[user];

            uint256 timeElapsed = block.timestamp - lastMintTime;
            uint256 newReward = calculateReward(newDavMinted);

            // Apply decay only if within the decay period
            if (timeElapsed <= MAX_DECAY_PERIOD) {
                newReward = getCurrentReward(newReward, timeElapsed);
                reward += newReward;
            }
        }
        return reward;
    }
    function mintReward() public {
        uint256 reward = userRewardAmount[msg.sender];
        require(reward > 0, "No reward to mint");

        uint256 currentDavHoldings = davToken.balanceOf(msg.sender);
        uint256 lastHolding = lastDavHolding[msg.sender];

        // Ensure the user has additional DAV holdings since the last record
        require(
            currentDavHoldings >= lastHolding,
            "No new DAV holdings to mint extra"
        );

        uint256 extraHoldings = currentDavHoldings - lastHolding;
        uint256 contractReward = extraHoldings * 1000000000;

        // Mint rewards to the user
        _mint(msg.sender, reward);

        // Mint additional rewards to the contract based on extra holdings
        _mint(address(this), contractReward);

        // Reset reward and update last holding information
        userRewardAmount[msg.sender] = 0;
        lastDavHolding[msg.sender] = currentDavHoldings; // Update last holdings
    }

    function getCurrentReward(
        uint256 baseReward,
        uint256 timeElapsed
    ) public pure returns (uint256) {
        uint256 decayPeriods = timeElapsed / 1 minutes;
        uint256 decayFactor = (100 - DAILY_DECAY_PERCENT) ** decayPeriods;
        return (baseReward * decayFactor) / (100 ** decayPeriods);
    }

    function calculateReward(uint256 davAmount) public pure returns (uint256) {
        uint256 scaled = davAmount / 5000000;
        return ((scaled * (MAX_SUPPLY * 200)) / 1000) / 1e18;
    }

    function viewUserTimestamps(
        address user
    ) public view returns (uint256 davMintTimestamp, uint256 lastHolding) {
        davMintTimestamp = davToken.viewLastMintTimeStamp(user);
        lastHolding = lastDavHolding[user];
    }

    function getCurrentDecayPercentage() public view returns (uint256) {
        if (block.timestamp < REWARD_DECAY_START) return 0;
        uint256 elapsed = block.timestamp - REWARD_DECAY_START;
        return (elapsed / 1 minutes) * DAILY_DECAY_PERCENT;
    }

    function viewMintableAmountWithDetails(
        address user
    )
        public
        view
        returns (uint256 nonDecrementedReward, uint256 decrementedReward)
    {
        uint256 reward = userRewardAmount[user];
        require(reward > 0, "No reward to view");

        uint256 davMintTimestamp = davToken.viewLastMintTimeStamp(user);
        uint256 elapsed = block.timestamp - davMintTimestamp;
        nonDecrementedReward = reward;
        decrementedReward = getCurrentReward(reward, elapsed);
    }
}
