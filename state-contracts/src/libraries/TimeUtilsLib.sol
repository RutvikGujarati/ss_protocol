// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TimeUtilsLib {
    function calculateNextClaimStartDubai(
        uint256 blockTimestamp
    ) internal pure returns (uint256) {
        uint256 dubaiOffset = 4 hours;
        uint256 secondsInDay = 86400;
        uint256 targetDubaiHour = 9; // 2 PM UTC == 6 PM Dubai
        uint256 targetDubaiMinute = 25;

        uint256 nowDubai;
        unchecked {
            nowDubai = blockTimestamp + dubaiOffset;
        }

        uint256 todayStartDubai;
        unchecked {
            todayStartDubai = (nowDubai / secondsInDay) * secondsInDay;
        }

        uint256 targetTimeDubai;
        unchecked {
            targetTimeDubai =
                todayStartDubai +
                (targetDubaiHour * 1 hours) +
                (targetDubaiMinute * 1 minutes);
        }

        if (nowDubai >= targetTimeDubai) {
            unchecked {
                targetTimeDubai += secondsInDay;
            }
        }

        uint256 finalTimestamp;
        unchecked {
            finalTimestamp = targetTimeDubai - dubaiOffset;
        }

        return finalTimestamp;
    }
}
