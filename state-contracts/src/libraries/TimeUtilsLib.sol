// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TimeUtilsLib {
    uint256 internal constant SECONDS_IN_DAY = 86400;
    uint256 internal constant TARGET_GMT_HOUR = 16;
    uint256 internal constant TARGET_GMT_MINUTE = 0;

    /**
     * @notice Calculates the next claim start time based on GMT.
     * @param blockTimestamp The current block timestamp in seconds.
     * @return finalTimestamp The next TARGET_GMT_HOUR PM GMT claim time.
     */
    function calculateNextClaimStartGMT(
        uint256 blockTimestamp
    ) internal pure returns (uint256 finalTimestamp) {
        require(blockTimestamp > 0, "Invalid timestamp");
        uint256 todayStart = (blockTimestamp / SECONDS_IN_DAY) * SECONDS_IN_DAY;
        uint256 targetTime = todayStart +
            (TARGET_GMT_HOUR * 1 hours) +
            (TARGET_GMT_MINUTE * 1 minutes);

        if (blockTimestamp >= targetTime) {
            targetTime += SECONDS_IN_DAY;
        }

        finalTimestamp = targetTime;
    }
}
