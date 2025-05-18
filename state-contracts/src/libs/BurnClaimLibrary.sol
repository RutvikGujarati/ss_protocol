// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

library BurnClaimLibrary {
    using SafeERC20 for IERC20;

    // Events for burn and claim
    event TokensBurned(address indexed user, uint256 amount, uint256 cycle);
    event RewardClaimed(address indexed user, uint256 amount, uint256 cycle);

    struct UserBurn {
        uint256 amount;
        uint256 totalAtTime;
        uint256 timestamp;
        uint256 cycleNumber;
        uint256 userShare; // Scaled by 1e18
        bool claimed;
    }

    function burnState(
        uint256 amount,
        address sender,
        uint256 userBalance,
        uint256 minDAV,
        IERC20 stateToken,
        uint256 deployTime,
        uint256 claimInterval,
        bool canClaimFunction,
        address burnAddress,
        uint256 totalStateBurned,
        mapping(address => uint256) storage userBurnedAmount,
        mapping(address => mapping(uint256 => uint256)) storage userCycleBurned,
        mapping(uint256 => uint256) storage cycleTotalBurned,
        mapping(address => uint256[]) storage userUnclaimedCycles,
        mapping(address => UserBurn[]) storage burnHistory,
        mapping(address => uint256) storage lastBurnCycle
    ) external {
        require(userBalance >= minDAV, "Need at least 10 DAV");
        require(amount > 0, "Burn amount must be > 0");
        require(
            stateToken.allowance(sender, address(this)) >= amount,
            "Insufficient allowance"
        );
        require(
            !canClaimFunction,
            "Must claim previous rewards before burning"
        );

        uint256 currentCycle = (block.timestamp - deployTime) / claimInterval;
        totalStateBurned += amount;
        userBurnedAmount[sender] += amount;
        userCycleBurned[sender][currentCycle] += amount;
        cycleTotalBurned[currentCycle] += amount;

        uint256 userShare = cycleTotalBurned[currentCycle] > 0
            ? (userCycleBurned[sender][currentCycle] * 1e18) /
                cycleTotalBurned[currentCycle]
            : 1e18;

        bool cycleExists = false;
        for (uint256 i = 0; i < userUnclaimedCycles[sender].length; i++) {
            if (userUnclaimedCycles[sender][i] == currentCycle) {
                cycleExists = true;
                break;
            }
        }
        if (!cycleExists) {
            userUnclaimedCycles[sender].push(currentCycle);
        }

        burnHistory[sender].push(
            UserBurn({
                amount: amount,
                totalAtTime: cycleTotalBurned[currentCycle],
                timestamp: block.timestamp,
                cycleNumber: currentCycle,
                userShare: userShare,
                claimed: false
            })
        );
        lastBurnCycle[sender] = currentCycle;

        stateToken.safeTransferFrom(sender, burnAddress, amount);
        emit TokensBurned(sender, amount, currentCycle);
    }

    function claimPLS(
        address sender,
        uint256 deployTime,
        uint256 claimInterval,
        mapping(address => uint256[]) storage userUnclaimedCycles,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation,
        mapping(uint256 => uint256) storage cycleUnclaimedPLS,
        mapping(address => mapping(uint256 => uint256)) storage userCycleBurned,
        mapping(uint256 => uint256) storage cycleTotalBurned,
        mapping(address => mapping(uint256 => bool)) storage hasClaimedCycle,
        mapping(address => mapping(uint256 => bool)) storage userBurnClaimed,
        mapping(address => UserBurn[]) storage burnHistory,
        uint256 holderFunds
    ) external {
        uint256 currentCycle = (block.timestamp - deployTime) / claimInterval;
        require(currentCycle > 0, "Claim period not started");

        uint256 totalReward = 0;
        uint256 unclaimedLength = userUnclaimedCycles[sender].length;
        uint256[] memory cyclesToKeep = new uint256[](unclaimedLength);
        uint256 keepCount = 0;

        for (uint256 i = 0; i < unclaimedLength; i++) {
            uint256 cycle = userUnclaimedCycles[sender][i];
            if (
                cycle >= currentCycle ||
                cycleTreasuryAllocation[cycle] == 0 ||
                hasClaimedCycle[sender][cycle]
            ) {
                cyclesToKeep[keepCount++] = cycle;
                continue;
            }

            uint256 userBurn = userCycleBurned[sender][cycle];
            uint256 totalBurn = cycleTotalBurned[cycle];
            if (userBurn == 0 || totalBurn == 0) {
                continue;
            }

            uint256 userShare = (userBurn * 1e18) / totalBurn;
            uint256 reward = (cycleTreasuryAllocation[cycle] * userShare) /
                1e18;
            if (cycleUnclaimedPLS[cycle] < reward) {
                cyclesToKeep[keepCount++] = cycle;
                continue;
            }

            cycleUnclaimedPLS[cycle] -= reward;
            totalReward += reward;
            hasClaimedCycle[sender][cycle] = true;
            userBurnClaimed[sender][cycle] = true;

            for (uint256 j = 0; j < burnHistory[sender].length; j++) {
                if (
                    burnHistory[sender][j].cycleNumber == cycle &&
                    !burnHistory[sender][j].claimed
                ) {
                    burnHistory[sender][j].claimed = true;
                    break;
                }
            }
        }

        if (keepCount < unclaimedLength) {
            uint256[] memory newUnclaimed = new uint256[](keepCount);
            for (uint256 i = 0; i < keepCount; i++) {
                newUnclaimed[i] = cyclesToKeep[i];
            }
            userUnclaimedCycles[sender] = newUnclaimed;
        }

        require(totalReward > 0, "Nothing to claim");
        require(
            (address(this).balance - holderFunds) >= totalReward,
            "Insufficient contract balance"
        );

        (bool success, ) = payable(sender).call{value: totalReward}("");
        require(success, "PLS transfer failed");
        emit RewardClaimed(sender, totalReward, currentCycle);
    }
    function getUserSharePercentage(
        address user,
        uint256 deployTime,
        uint256 claimInterval,
        uint256 basisPoints,
        mapping(address => mapping(uint256 => uint256)) storage userCycleBurned,
        mapping(uint256 => uint256) storage cycleTotalBurned,
        mapping(address => mapping(uint256 => bool)) storage userBurnClaimed
    ) external view returns (uint256) {
        uint256 currentCycle = (block.timestamp - deployTime) / claimInterval;
        // Check if current time is still inside this cycle
        if (block.timestamp < deployTime + (currentCycle + 1) * claimInterval) {
            // We're inside the current cycle – show live percentage
            uint256 userBurn = userCycleBurned[user][currentCycle];
            uint256 totalBurn = cycleTotalBurned[currentCycle];
            if (totalBurn == 0 || userBurn == 0) return 0;
            return (userBurn * basisPoints) / totalBurn; // basis points (10000 = 100.00%)
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
            return (userBurn * basisPoints) / totalBurn;
        }
    }
    function getClaimablePLS(
        address user,
        uint256 currentCycle,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation,
        mapping(address => mapping(uint256 => bool)) storage hasClaimedCycle,
        mapping(address => uint256[]) storage userUnclaimedCycles,
        mapping(uint256 => uint256) storage cycleUnclaimedPLS,
        mapping(address => mapping(uint256 => uint256)) storage userCycleBurned,
        mapping(uint256 => uint256) storage cycleTotalBurned
    ) public view returns (uint256) {
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
}
