// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Distribution {
    // Constants for distribution shares
    struct HolderState {
        mapping(address => bool) isDAVHolder;
        address[] davHolders;
        uint256 davHoldersCount;
        mapping(address => uint256) holderRewards;
        uint256 holderFunds;
        mapping(uint256 => uint256) cycleTreasuryAllocation;
        mapping(uint256 => uint256) cycleUnclaimedPLS;
    }

    event HolderAdded(address indexed account);
    /**
     * @notice Updates the DAV holder status for a given account based on their active balance.
     * @dev
     * - Adds the account to `davHolders` if they have an active balance and aren't already registered.
     * - Removes the account from `davHolders` if they no longer have an active balance.
     * - Skips updating if the account is the governance address.
     * @param account The address of the user whose holder status is being updated.
     */
    function updateHolderStatus(
        HolderState storage state,
        address account,
        address governance,
        function(address) view returns (uint256) getActiveBalance
    ) internal {
        bool hasActiveBalance = getActiveBalance(account) > 0;
        if (hasActiveBalance && account != governance) {
            if (!state.isDAVHolder[account]) {
                state.isDAVHolder[account] = true;
                state.davHoldersCount++;
                bool alreadyExists = false;
                // This meant to run for all holders to push into array
                // sync with latest dav holders
                for (uint256 i = 0; i < state.davHolders.length; i++) {
                    if (state.davHolders[i] == account) {
                        alreadyExists = true;
                        break;
                    }
                }
                if (!alreadyExists) {
                    state.davHolders.push(account);
                    emit HolderAdded(account);
                }
            }
        } else if (!hasActiveBalance && state.isDAVHolder[account]) {
            state.isDAVHolder[account] = false;
            state.davHoldersCount--;
            for (uint256 i = 0; i < state.davHolders.length; i++) {
                if (state.davHolders[i] == account) {
                    state.davHolders[i] = state.davHolders[
                        state.davHolders.length - 1
                    ];
                    state.davHolders.pop();
                    break;
                }
            }
        }
    }
    // This loop is safe under typical block gas limits (~30 million gas)
    // Each iteration is lightweight and avoids nested expensive operations
    // Note: This loop is safe under expected davHolders lengths.
    /**
     * @notice Distributes the holder share among eligible DAV holders based on their active minted balance.
     * @param state The HolderState storage reference.
     * @param holderShare The total share to be distributed among holders.
     * @param governance The address of the governance account, which is excluded from rewards.
     * @param getActiveMintedBalance A function to retrieve the active minted balance of a holder.
     */
    function distributeHolderShare(
        HolderState storage state,
        uint256 holderShare,
        address governance,
        function(address) view returns (uint256) getActiveMintedBalance
    ) internal {
        if (holderShare == 0) return;

        uint256 totalActiveMintedSupply = 0;
        address[] memory eligibleHolders = new address[](
            state.davHolders.length
        );
        uint256 count = 0;

        for (uint256 i = 0; i < state.davHolders.length; i++) {
            address holder = state.davHolders[i];
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

        for (uint256 i = 0; i < count; i++) {
            address holder = eligibleHolders[i];
            uint256 balance = getActiveMintedBalance(holder);
            if (balance > 0) {
                uint256 portion = (holderShare * balance) /
                    totalActiveMintedSupply;
                state.holderRewards[holder] += portion;
                totalDistributed += portion;
                lastEligible = holder;
            }
        }
        // 🔒 Precision Dust Handling:
        // Due to integer division, small amounts (dust) may remain undistributed.
        // These are added to the `lastEligible` holder to ensure no tokens are lost.
        if (totalDistributed < holderShare && lastEligible != address(0)) {
            uint256 remainder = holderShare - totalDistributed;
            state.holderRewards[lastEligible] += remainder;
            totalDistributed += remainder;
        }
        // ✅ This guarantees full distribution of `holderShare` with no loss due to division rounding.
        state.holderFunds += totalDistributed;
    }
    /**
     * @notice Distributes cycle allocations to the treasury and unclaimed PLS for future cycles.
     * @param state The HolderState storage reference.
     * @param stateLPShare The share of LP tokens allocated to the state.
     * @param currentCycle The current cycle number.
     * @param treasuryClaimPercentage The percentage of the LP share allocated to the treasury.
     * @param cycleCount The number of cycles to distribute the allocation across.
     */
    function distributeCycleAllocations(
        HolderState storage state,
        uint256 stateLPShare,
        uint256 currentCycle,
        uint256 treasuryClaimPercentage,
        uint256 cycleCount
    ) internal {
        require(cycleCount > 0 && cycleCount <= 10, "Invalid cycle count");

        uint256 cycleAllocation = (stateLPShare * treasuryClaimPercentage) /
            100;
        // Distribute allocations across CYCLE_ALLOCATION_COUNT (10) cycles.
        // This loop is necessary to spread the treasury allocation across multiple
        // future cycles to align with the protocol's treasury claiming mechanism.
        // With CYCLE_ALLOCATION_COUNT fixed at 10, the gas cost is bounded and
        // acceptable, as each iteration performs two storage writes. We avoid
        // complex optimizations like single-cycle aggregation or off-chain calculations
        // to maintain clear, predictable logic that ensures funds are distributed
        // across the intended cycles, as required by the protocol.
        for (uint256 i = 0; i < cycleCount; i++) {
            uint256 targetCycle = currentCycle + i;
            state.cycleTreasuryAllocation[targetCycle] += cycleAllocation;
            state.cycleUnclaimedPLS[targetCycle] += cycleAllocation;
        }
    }

    function calculateETHDistribution(
        uint256 value,
        address sender,
        string memory referralCode,
        address governance,
        uint256 HOLDER_SHARE,
        uint256 LIQUIDITY_SHARE,
        uint256 DEVELOPMENT_SHARE,
        uint256 REFERRAL_BONUS,
        uint256 davHoldersCount,
        uint256 totalActiveSupply,
        mapping(string => address) storage referralCodeToUser
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
        bool excludeHolderShare = sender == governance;
        require(
            !excludeHolderShare || sender != address(0),
            "Invalid governance address"
        );

        holderShare = excludeHolderShare ? 0 : (value * HOLDER_SHARE) / 100;
        liquidityShare = (value * LIQUIDITY_SHARE) / 100;
        developmentShare = (value * DEVELOPMENT_SHARE) / 100;
        referralShare = 0;
        referrer = address(0);

        if (bytes(referralCode).length > 0) {
            address _ref = referralCodeToUser[referralCode];
            if (_ref != address(0) && _ref != sender) {
                referralShare = (value * REFERRAL_BONUS) / 100;
                referrer = _ref;
            }
        }

        if (davHoldersCount == 0 || totalActiveSupply == 0) {
            liquidityShare += holderShare;
            holderShare = 0;
        }

        uint256 distributed = holderShare +
            liquidityShare +
            developmentShare +
            referralShare;
        require(distributed <= value, "Over-allocation");

        stateLPShare = value - distributed;
    }
    function _earned(
        HolderState storage state,
        address account,
        address governance
    ) public view returns (uint256) {
        if (account == governance) {
            return 0;
        }
        return state.holderRewards[account];
    }
    function _holderLength(
        HolderState storage state
    ) public view returns (uint256) {
        require(
            state.davHolders.length == state.davHoldersCount,
            "Inconsistent holder count"
        );
        return state.davHolders.length;
    }
}
