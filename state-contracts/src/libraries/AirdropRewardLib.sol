// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title RewardDistributionLib
 * @dev Library for handling reward distribution logic
 */
library RewardDistributionLib {
    using SafeERC20 for IERC20;

    struct RewardData {
        uint256 newDavContributed;
        uint256 reward;
        uint256 cycle;
        uint256 adjustedAirdropAmount;
    }

    struct BatchData {
        uint256[] amounts;
        uint256[] timestamps;
        uint256 expireTime;
    }

    struct UserState {
        uint256 currentDavHolding;
        uint256 lastHolding;
        uint256 expired;
        bool isGovernance;
    }

    struct RewardSettings {
        address governanceAddress;
        address devAddress;
        uint256 govAirdrop;
        uint256 userAirdrop;
        uint256 maxGovAirdrop;
        uint256 maxUserAirdrop;
        uint256 claimInterval;
        uint256 minDavRequired; // e.g. 1 DAV = 1e18
    }

    event RewardDistributed(address indexed user, uint256 reward);

    /**
     * @dev Calculates reward for distribution
     * @param user User address
     * @param inputToken Token address
     * @param userState User state data
     * @param batchData Batch data from DAV contract
     * @param claimedBatches Mapping of claimed batches
     * @param airdropAmount Base airdrop amount
     * @param precisionFactor Precision factor for calculations
     * @return rewardData Calculated reward data
     */
    function calculateReward(
        address user,
        address inputToken,
        UserState memory userState,
        BatchData memory batchData,
        mapping(address => mapping(address => mapping(uint256 => bool)))
            storage claimedBatches,
        uint256 airdropAmount,
        uint256 cycle,
        uint256 precisionFactor
    ) internal view returns (RewardData memory rewardData) {
        // Calculate reduction percent: 5% per cycle, capped at 100%
        rewardData.cycle = cycle; 
        uint256 reductionPercent = rewardData.cycle * 5 >= 100
            ? 0
            : 100 - (rewardData.cycle * 5);
        rewardData.adjustedAirdropAmount =
            (airdropAmount * reductionPercent) /
            100;

        if (userState.isGovernance) {
            // Governance user: simple balance difference
            rewardData.newDavContributed = userState.currentDavHolding >
                userState.lastHolding
                ? userState.currentDavHolding - userState.lastHolding
                : 0;
        } else {
            // Normal users: process using MintBatches
            uint256 adjustedLastHolding = userState.lastHolding;

            if (userState.expired >= adjustedLastHolding) {
                adjustedLastHolding = 0;
            } else {
                adjustedLastHolding -= userState.expired;
            }

            // Count unclaimed active batches
            for (uint256 i = 0; i < batchData.amounts.length; i++) {
                if (
                    block.timestamp <=
                    batchData.timestamps[i] + batchData.expireTime &&
                    !claimedBatches[user][inputToken][i]
                ) {
                    rewardData.newDavContributed += batchData.amounts[i];
                }
            }
        }

        if (rewardData.newDavContributed > 0) {
            rewardData.reward =
                (rewardData.newDavContributed *
                    rewardData.adjustedAirdropAmount +
                    precisionFactor -
                    1) /
                precisionFactor;
        }
    }

    /**
     * @dev Updates user state after reward distribution
     * @param user User address
     * @param inputToken Token address
     * @param userState User state data
     * @param batchData Batch data from DAV contract
     * @param lastDavHolding Mapping of last DAV holdings
     * @param hasClaimed Mapping of claimed status
     * @param claimedBatches Mapping of claimed batches
     */
    function updateUserState(
        address user,
        address inputToken,
        UserState memory userState,
        BatchData memory batchData,
        mapping(address => mapping(address => uint256)) storage lastDavHolding,
        mapping(address => mapping(address => bool)) storage hasClaimed,
        mapping(address => mapping(address => mapping(uint256 => bool)))
            storage claimedBatches
    ) internal {
        if (userState.isGovernance) {
            // Governance user: simple update
            lastDavHolding[user][inputToken] = userState.currentDavHolding;
            hasClaimed[user][inputToken] = true;
        } else {
            // Normal users: handle batch claiming and expiration
            uint256 adjustedLastHolding = userState.lastHolding;

            if (userState.expired >= adjustedLastHolding) {
                lastDavHolding[user][inputToken] = 0;
                adjustedLastHolding = 0;

                // Clear claimed batch markers for expired batches
                for (uint256 i = 0; i < batchData.timestamps.length; i++) {
                    if (
                        block.timestamp >
                        batchData.timestamps[i] + batchData.expireTime
                    ) {
                        claimedBatches[user][inputToken][i] = false;
                    }
                }
            } else {
                lastDavHolding[user][inputToken] -= userState.expired;
                adjustedLastHolding -= userState.expired;
            }

            // Mark active batches as claimed
            uint256[] memory claimedBatchIndices = new uint256[](
                batchData.amounts.length
            );
            uint256 claimCount = 0;

            for (uint256 i = 0; i < batchData.amounts.length; i++) {
                if (
                    block.timestamp <=
                    batchData.timestamps[i] + batchData.expireTime &&
                    !claimedBatches[user][inputToken][i]
                ) {
                    claimedBatchIndices[claimCount] = i;
                    claimCount++;
                }
            }

            // Mark those batches as claimed
            for (uint256 i = 0; i < claimCount; i++) {
                claimedBatches[user][inputToken][claimedBatchIndices[i]] = true;
            }

            lastDavHolding[user][inputToken] = userState.currentDavHolding;
        }
    }

    /**
     * @dev Calculates claimable reward for a user
     * @param user User address
     * @param inputToken Token address
     * @param userState User state data
     * @param batchData Batch data from DAV contract
     * @param claimedBatches Mapping of claimed batches
     * @param airdropAmount Base airdrop amount
     * @param precisionFactor Precision factor for calculations
     * @param cycle Current auction cycle
     * @return claimableReward Amount of claimable reward
     */
    function getClaimableReward(
        address user,
        address inputToken,
        UserState memory userState,
        BatchData memory batchData,
        mapping(address => mapping(address => mapping(uint256 => bool)))
            storage claimedBatches,
        uint256 airdropAmount,
        uint256 precisionFactor,
        uint256 cycle
    ) internal view returns (uint256 claimableReward) {
        uint256 reductionPercent = cycle * 5 >= 100 ? 0 : 100 - (cycle * 5);
        uint256 adjustedAirdropAmount = (airdropAmount * reductionPercent) /
            100;

        if (userState.isGovernance) {
            // Governance user: simple balance difference
            uint256 newDavContributed = userState.currentDavHolding >
                userState.lastHolding
                ? userState.currentDavHolding - userState.lastHolding
                : 0;

            if (newDavContributed == 0) return 0;

            return
                (newDavContributed *
                    adjustedAirdropAmount +
                    precisionFactor -
                    1) / precisionFactor;
        } else {
            // Non-governance logic
            uint256 adjustedLastHolding = userState.lastHolding;

            if (userState.expired >= adjustedLastHolding) {
                adjustedLastHolding = 0;
            } else {
                adjustedLastHolding -= userState.expired;
            }

            uint256 newDavContributed = 0;

            for (uint256 i = 0; i < batchData.amounts.length; i++) {
                if (
                    block.timestamp <=
                    batchData.timestamps[i] + batchData.expireTime &&
                    !claimedBatches[user][inputToken][i]
                ) {
                    newDavContributed += batchData.amounts[i];
                }
            }

            if (newDavContributed == 0) return 0;

            return
                (newDavContributed *
                    adjustedAirdropAmount +
                    precisionFactor -
                    1) / precisionFactor;
        }
    }

    /**
     * @dev Checks if user has already claimed airdrop
     * @param user User address
     * @param inputToken Token address
     * @param userState User state data
     * @param batchData Batch data from DAV contract
     * @param claimedBatches Mapping of claimed batches
     * @return hasClaimedAirdrop True if user has claimed airdrop
     */
    function hasAirdroppedClaim(
        address user,
        address inputToken,
        UserState memory userState,
        BatchData memory batchData,
        mapping(address => mapping(address => mapping(uint256 => bool)))
            storage claimedBatches
    ) internal view returns (bool hasClaimedAirdrop) {
        if (userState.currentDavHolding == 0) return false;

        if (userState.isGovernance) {
            // Governance: use simple last vs current balance
            return userState.currentDavHolding <= userState.lastHolding;
        }

        // Non-governance: check for unclaimed active batches
        for (uint256 i = 0; i < batchData.amounts.length; i++) {
            if (
                block.timestamp <=
                batchData.timestamps[i] + batchData.expireTime &&
                !claimedBatches[user][inputToken][i]
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Validates distribution parameters
     * @param user User address
     * @param inputToken Token address
     * @param sender Message sender
     * @param supportedTokens Mapping of supported tokens
     * @return isValid True if parameters are valid
     */
    function validateDistribution(
        address user,
        address inputToken,
        address sender,
        mapping(address => bool) storage supportedTokens
    ) internal view returns (bool isValid) {
        require(user != address(0), "Invalid user address");
        require(supportedTokens[inputToken], "Unsupported token");
        require(sender == user, "Invalid sender");
        return true;
    }

    /**
     * @dev Transfers reward tokens
     * @param token Token contract
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferReward(IERC20 token, address to, uint256 amount) internal {
        require(amount > 0, "Reward too small");
        token.safeTransfer(to, amount);
    }

    //Token Owner and governance airdrop
    function giveRewardToTokenOwner(
        address token,
        address msgSender,
        mapping(address => address) storage tokenOwners,
        mapping(address => uint256) storage totalClaimedByGovernance,
        mapping(address => uint256) storage totalClaimedByUser,
        mapping(address => mapping(address => uint256)) storage lastClaimTime,
        RewardSettings memory settings,
        uint256 getDavBalance,
        IERC20 rewardToken
    ) internal {
        address owner = tokenOwners[token];
        require(owner != address(0), "Token has no registered owner");

        address claimant;
        uint256 rewardAmount;

        if (msgSender == settings.governanceAddress) {
            claimant = settings.devAddress;
            rewardAmount = settings.govAirdrop;
            require(
                totalClaimedByGovernance[claimant] + rewardAmount <=
                    settings.maxGovAirdrop,
                "Governance airdrop limit reached"
            );
        } else {
            require(
                msgSender == owner,
                "Only token owner or governance can claim"
            );
            require(
                getDavBalance >= settings.minDavRequired,
                "Owner must hold at least 1 DAV"
            );
            claimant = owner;
            rewardAmount = settings.userAirdrop;
            require(
                totalClaimedByUser[claimant] + rewardAmount <=
                    settings.maxUserAirdrop,
                "User airdrop limit reached"
            );
        }

        uint256 lastClaim = lastClaimTime[claimant][token];
        require(
            block.timestamp >= lastClaim + settings.claimInterval,
            "Claim not available yet"
        );

        lastClaimTime[claimant][token] = block.timestamp;

        if (msgSender == settings.governanceAddress) {
            totalClaimedByGovernance[claimant] += rewardAmount;
        } else {
            totalClaimedByUser[claimant] += rewardAmount;
        }

        rewardToken.safeTransfer(claimant, rewardAmount);
        emit RewardDistributed(claimant, rewardAmount);
    }
}
