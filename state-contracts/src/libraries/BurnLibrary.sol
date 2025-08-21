// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

library BurnLibrary {
    using SafeERC20 for IERC20;
    // Constants for burn and claim

    struct BurnAndClaimState {
        mapping(address => uint256) userBurnedAmount;
        mapping(address => mapping(uint256 => bool)) hasClaimedCycle;
        mapping(address => UserBurn[]) burnHistory;
        mapping(address => mapping(uint256 => uint256)) userCycleBurned;
        mapping(uint256 => uint256) cycleTotalBurned;
        mapping(address => uint256[]) userUnclaimedCycles;
        uint256 totalStateBurned;
        uint256 lastBurnCycle;
    }

    struct UserBurn {
        uint256 amount;
        uint256 totalAtTime;
        uint256 timestamp;
        uint256 cycleNumber;
        uint256 userShare;
        bool claimed;
    }

    event TokensBurned(
        address indexed user,
        uint256 indexed amount,
        uint256 cycle
    );
    event RewardClaimed(address indexed user, uint256 amount, uint256 cycle);

    /**
     * @notice Burns a specified amount of tokens from a user and updates the burn state.
     * @param state The BurnAndClaimState storage reference.
     * @param user The address of the user burning tokens.
     * @param amount The amount of tokens to burn.
     * @param StateToken The token being burned.
     * @param governance The governance address, which is exempt from minimum balance checks.
     * @param MIN_DAV Minimum active balance required for users other than governance.
     * @param claimStartTime The timestamp when claiming rewards starts.
     * @param CLAIM_INTERVAL The interval between claimable cycles.
     * @param BURN_ADDRESS The address where tokens are burned.
     * @param getActiveBalance Function to get the user's active balance.
     * @param cycleTreasuryAllocation Mapping of cycle allocations for treasury.
     */
    function burnState(
        BurnAndClaimState storage state,
        address user,
        uint256 amount,
        IERC20 StateToken,
        address governance,
        uint256 MIN_DAV,
        uint256 claimStartTime,
        uint256 CLAIM_INTERVAL,
        address BURN_ADDRESS,
        function(address) view returns (uint256) getActiveBalance,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation
    ) internal {
        require(amount > 0, "Burn amount must be > 0");
        require(block.timestamp >= claimStartTime, "Burning not allowed yet");
        require(
            StateToken.allowance(user, address(this)) >= amount,
            "Insufficient allowance"
        );
        if (user != governance) {
            require(getActiveBalance(user) >= MIN_DAV, "Need at least 1 DAV");
        }
        require(
            !canClaim(
                state,
                user,
                claimStartTime,
                CLAIM_INTERVAL,
                cycleTreasuryAllocation
            ),
            "Must claim previous rewards"
        );

        uint256 currentCycle = (block.timestamp - claimStartTime) /
            CLAIM_INTERVAL;
        state.totalStateBurned += amount;
        state.userBurnedAmount[user] += amount;
        state.userCycleBurned[user][currentCycle] += amount;
        state.cycleTotalBurned[currentCycle] += amount;

        uint256 userShare = state.cycleTotalBurned[currentCycle] > 0
            ? (state.userCycleBurned[user][currentCycle] * 1e18) /
                state.cycleTotalBurned[currentCycle]
            : 1e18;

        bool cycleExists = false;
        for (uint256 i = 0; i < state.userUnclaimedCycles[user].length; i++) {
            if (state.userUnclaimedCycles[user][i] == currentCycle) {
                cycleExists = true;
                break;
            }
        }
        if (!cycleExists) {
            state.userUnclaimedCycles[user].push(currentCycle);
        }

        state.burnHistory[user].push(
            UserBurn({
                amount: amount,
                totalAtTime: state.cycleTotalBurned[currentCycle],
                timestamp: block.timestamp,
                cycleNumber: currentCycle,
                userShare: userShare,
                claimed: false
            })
        );
        state.lastBurnCycle = currentCycle;
        StateToken.safeTransferFrom(user, BURN_ADDRESS, amount);
        emit TokensBurned(user, amount, currentCycle);
    }

    function canClaim(
        BurnAndClaimState storage state,
        address user,
        uint256 claimStartTime,
        uint256 CLAIM_INTERVAL,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation
    ) internal view returns (bool) {
        uint256 currentCycle = (block.timestamp - claimStartTime) /
            CLAIM_INTERVAL;
        for (uint256 i = 0; i < state.userUnclaimedCycles[user].length; i++) {
            uint256 cycle = state.userUnclaimedCycles[user][i];
            if (cycle >= currentCycle || cycleTreasuryAllocation[cycle] == 0)
                continue;
            if (
                state.userCycleBurned[user][cycle] > 0 &&
                !state.hasClaimedCycle[user][cycle]
            ) {
                return true;
            }
        }
        return false;
    }

    function getClaimablePLS(
        BurnAndClaimState storage state,
        address user,
        uint256 claimStartTime,
        uint256 CLAIM_INTERVAL,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation,
        mapping(uint256 => uint256) storage cycleUnclaimedPLS
    ) internal view returns (uint256) {
        uint256 currentCycle = (block.timestamp - claimStartTime) /
            CLAIM_INTERVAL;
        uint256 totalClaimable = 0;
        for (uint256 i = 0; i < state.userUnclaimedCycles[user].length; i++) {
            uint256 cycle = state.userUnclaimedCycles[user][i];
            if (
                cycle >= currentCycle ||
                cycleTreasuryAllocation[cycle] == 0 ||
                state.hasClaimedCycle[user][cycle]
            ) continue;
            uint256 userBurn = state.userCycleBurned[user][cycle];
            uint256 totalBurn = state.cycleTotalBurned[cycle];
            if (userBurn == 0 || totalBurn == 0) continue;
            uint256 userShare = (userBurn * 1e18) / totalBurn;
            uint256 cycleReward = (cycleTreasuryAllocation[cycle] * userShare) /
                1e18;
            if (cycleReward > cycleUnclaimedPLS[cycle]) {
                cycleReward = cycleUnclaimedPLS[cycle];
            }
            totalClaimable += cycleReward;
        }
        return totalClaimable;
    }

    function claimPLS(
        BurnAndClaimState storage state,
        address user,
        uint256 claimStartTime,
        uint256 CLAIM_INTERVAL,
        uint256 holderFunds,
        uint256 getContractBalance,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation,
        mapping(uint256 => uint256) storage cycleUnclaimedPLS
    ) internal {
        uint256 currentCycle = (block.timestamp - claimStartTime) /
            CLAIM_INTERVAL;
        require(currentCycle > 0, "Claim period not started");
        uint256 totalReward = 0;
        uint256 startCycle = currentCycle > 10 ? currentCycle - 10 : 0;

        for (uint256 cycle = startCycle; cycle < currentCycle; cycle++) {
            if (
                cycleTreasuryAllocation[cycle] == 0 ||
                state.hasClaimedCycle[user][cycle]
            ) continue;
            uint256 userBurn = state.userCycleBurned[user][cycle];
            uint256 totalBurn = state.cycleTotalBurned[cycle];
            if (userBurn == 0 || totalBurn == 0) continue;
            uint256 reward = (cycleTreasuryAllocation[cycle] * userBurn) /
                totalBurn;
            if (cycleUnclaimedPLS[cycle] < reward) continue;
            cycleUnclaimedPLS[cycle] -= reward;
            state.hasClaimedCycle[user][cycle] = true;
            totalReward += reward;
            require(
                cycleUnclaimedPLS[cycle] <= cycleTreasuryAllocation[cycle],
                "Invariant failed: cycleUnclaimed > treasuryAllocation"
            );
        }

        for (uint256 j = 0; j < state.burnHistory[user].length; j++) {
            uint256 cycleNum = state.burnHistory[user][j].cycleNumber;
            if (
                !state.burnHistory[user][j].claimed &&
                state.hasClaimedCycle[user][cycleNum]
            ) {
                state.burnHistory[user][j].claimed = true;
            }
            require(
                state.burnHistory[user][j].claimed ==
                    state.hasClaimedCycle[user][cycleNum],
                "Invariant failed: burnHistory.claimed != hasClaimedCycle"
            );
        }

        require(totalReward > 0, "Nothing to claim");
        require(
            getContractBalance - holderFunds >= totalReward,
            "Insufficient contract balance"
        );
        (bool success, ) = payable(user).call{value: totalReward}("");
        require(success, "PLS transfer failed");
        emit RewardClaimed(user, totalReward, currentCycle);
    }
    function getUserSharePercentage(
        BurnAndClaimState storage state,
        address user,
        uint256 claimStartTime,
        uint256 CLAIM_INTERVAL,
        uint256 BASIS_POINTS
    ) internal view returns (uint256) {
        uint256 currentCycle = (block.timestamp - claimStartTime) /
            CLAIM_INTERVAL;

        uint256 currentCycleEnd = claimStartTime +
            (currentCycle + 1) *
            CLAIM_INTERVAL;

        // Case 1: Still inside current cycle
        if (block.timestamp < currentCycleEnd) {
            uint256 userBurn = state.userCycleBurned[user][currentCycle];
            uint256 totalBurn = state.cycleTotalBurned[currentCycle];
            if (userBurn == 0 || totalBurn == 0) return 0;
            return (userBurn * BASIS_POINTS) / totalBurn;
        }

        // Case 2: Cycle is over — check previous
        if (currentCycle == 0) return 0;
        uint256 previousCycle = currentCycle - 1;

        if (
            state.hasClaimedCycle[user][previousCycle] ||
            state.userCycleBurned[user][previousCycle] == 0 ||
            state.cycleTotalBurned[previousCycle] == 0
        ) {
            return 0;
        }

        return
            (state.userCycleBurned[user][previousCycle] * BASIS_POINTS) /
            state.cycleTotalBurned[previousCycle];
    }
}
