// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library AuctionLib {
	/**
	 * @notice Represents the auction cycle data for a token
	 * @param firstAuctionStart Timestamp of the first auction start
	 * @param isInitialized Whether the auction cycle has been initialized
	 * @param auctionCount Number of auctions that have occurred in this cycle
	 */
    struct AuctionCycle {
        uint256 firstAuctionStart;
        bool isInitialized;
        uint256 auctionCount;
    }
	// Constants for auction cycles
    uint256 public constant AUCTION_INTERVAL = 1 hours;
    uint256 public constant AUCTION_DURATION = 1 hours;
    uint256 public constant REVERSE_DURATION = 1 hours;
    uint256 public constant MAX_AUCTIONS = 20;

    /**
     * @notice Returns auction cycle data for a given input token
     * @param cycle The auction cycle data
     * @return initialized Whether the auction cycle has started
     * @return currentTime Current block timestamp
     * @return fullCycleLength Sum of auction duration and interval
     * @return firstAuctionStart Timestamp of the first auction start
     * @return cycleNumber Which auction cycle we're in
     * @return isValidCycle Whether the current cycle is active and valid
     */
    function getAuctionCycleData(
        AuctionCycle storage cycle
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

	/**
	 * @notice Checks if an auction is currently active for a given token
	 * @param cycle The auction cycle data
	 * @return bool Whether the auction is active
	 */
    function isAuctionActive(
        AuctionCycle storage cycle
    ) internal view returns (bool) {
        (
            bool initialized,
            uint256 currentTime,
            uint256 fullCycleLength,
            uint256 firstAuctionStart,
            uint256 cycleNumber,
            bool isValidCycle
        ) = getAuctionCycleData(cycle);

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

    /**
     * @notice Checks if a reverse auction is active for a given token
     * @param cycle The auction cycle data
     * @return bool Whether the reverse auction is active
     */
    function isReverseAuctionActive(
        AuctionCycle storage cycle
    ) internal view returns (bool) {
        (
            bool initialized,
            uint256 currentTime,
            uint256 fullCycleLength,
            uint256 firstAuctionStart,
            uint256 cycleNumber,
            bool isValidCycle
        ) = getAuctionCycleData(cycle);
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

    /**
     * @notice Returns the current auction cycle for a given token
     * @param cycle The auction cycle data
     * @return uint256 The current cycle number
     */
    function getCurrentAuctionCycle(
        AuctionCycle storage cycle
    ) internal view returns (uint256) {
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

    /**
     * @notice Returns the time left in the current auction
     * @param cycle The auction cycle data
     * @return uint256 Time left in seconds
     */
    function getAuctionTimeLeft(
        AuctionCycle storage cycle
    ) internal view returns (uint256) {
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
}
