// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TokenProcessingLibrary {
    // Event for token name addition
    event TokenNameAdded(address indexed user, string name);

    /**
     * @notice Struct for token entries, to be used by the main contract and library
     * @dev Defined here to ensure type consistency across contract and library
     */
    struct TokenEntry {
        address user;
        string tokenName;
        string emoji;
        uint8 status; // 0 = Pending, 1 = Processed
    }

    function processYourToken(
        string memory _tokenName,
        string memory _emoji,
        address sender,
        uint256 userBalance,
        address governance,
        uint256 stateLPShare,
        mapping(address => mapping(string => TokenEntry)) storage userTokenEntries,
        mapping(address => uint256) storage userTokenCount,
        mapping(address => string[]) storage usersTokenNames,
        mapping(string => address) storage tokenNameToOwner,
        mapping(string => bool) storage isTokenNameUsed,
        string[] storage allTokenNames,
        uint256 deployTime,
        uint256 claimInterval,
        uint256 cycleAllocationCount,
        uint256 treasuryClaimPercentage,
        mapping(uint256 => uint256) storage cycleTreasuryAllocation,
        mapping(uint256 => uint256) storage cycleUnclaimedPLS
    ) external {
        require(bytes(_tokenName).length > 0, "Please provide tokenName");
        require(!isTokenNameUsed[_tokenName], "Token name already used");
        require(utfStringLength(_emoji) <= 10, "Max 10 UTF-8 characters allowed");
        require(
            userTokenEntries[sender][_tokenName].user == address(0),
            "Token name already submitted by user"
        );

        uint256 tokensSubmitted = userTokenCount[sender];
        require(
            userBalance > tokensSubmitted,
            "You need more DAV to process new token"
        );

        if (sender != governance && stateLPShare > 0) {
            uint256 currentCycle = (block.timestamp - deployTime) / claimInterval;
            uint256 cycleAllocation = (stateLPShare * treasuryClaimPercentage) / 100;

            for (uint256 i = 0; i < cycleAllocationCount; i++) {
                uint256 targetCycle = currentCycle + i;
                cycleTreasuryAllocation[targetCycle] += cycleAllocation;
                cycleUnclaimedPLS[targetCycle] += cycleAllocation;
            }
        }

        usersTokenNames[sender].push(_tokenName);
        tokenNameToOwner[_tokenName] = sender;
        isTokenNameUsed[_tokenName] = true;
        userTokenCount[sender]++;
        allTokenNames.push(_tokenName);
        userTokenEntries[sender][_tokenName] = TokenEntry(sender, _tokenName, _emoji, 0); // Pending
        emit TokenNameAdded(sender, _tokenName);
    }

    /**
     * @notice Counts the number of UTF-8 characters in a string
     * @param str The input string
     * @return length The number of UTF-8 characters
     */
    function utfStringLength(string memory str) internal pure returns (uint256 length) {
        uint256 i = 0;
        bytes memory strBytes = bytes(str);
        while (i < strBytes.length) {
            uint8 b = uint8(strBytes[i]);
            if (b >> 7 == 0) {
                i += 1; // 1-byte character (ASCII)
            } else if (b >> 5 == 0x6) {
                i += 2; // 2-byte character
            } else if (b >> 4 == 0xE) {
                i += 3; // 3-byte character
            } else if (b >> 3 == 0x1E) {
                i += 4; // 4-byte character (emojis, many symbols)
            } else {
                revert("Invalid UTF-8 character");
            }
            length++;
        }
    }


    function getPendingTokenNames(
        address user,
        mapping(address => string[]) storage usersTokenNames,
        mapping(address => mapping(string => TokenEntry)) storage userTokenEntries
    ) external view returns (string[] memory) {
        string[] memory userTokens = usersTokenNames[user];
        string[] memory tempNames = new string[](userTokens.length);
        uint256 count = 0;

        for (uint256 i = 0; i < userTokens.length; i++) {
            string memory tokenName = userTokens[i];
            if (userTokenEntries[user][tokenName].status == 0) { // Pending
                tempNames[count] = tokenName;
                count++;
            }
        }

        string[] memory pendingNames = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            pendingNames[i] = tempNames[i];
        }
        return pendingNames;
    }
}