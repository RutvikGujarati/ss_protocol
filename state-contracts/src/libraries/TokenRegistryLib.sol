// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TokenRegistryLib {
	// Enum to represent the status of a token
    enum TokenStatus {
        Pending,
        Approved,
        Rejected
    }
	// Struct to represent a token entry in the registry
    struct TokenEntry {
        address user;
        string tokenName;
        string emojiOrImage;
        TokenStatus status;
    }

    struct TokenRegistry {
        mapping(string => bool) isTokenNameUsed;
        mapping(address => mapping(string => TokenEntry)) userTokenEntries;
        mapping(address => string[]) usersTokenNames;
        mapping(string => address) tokenNameToOwner;
        string[] allTokenNames;
        mapping(address => uint256) userTokenCount;
    }
	
    function contains(
        string memory str,
        string memory substr
    ) internal pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);
        if (substrBytes.length == 0 || substrBytes.length > strBytes.length)
            return false;
        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool matchFound = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    matchFound = false;
                    break;
                }
            }
            if (matchFound) return true;
        }
        return false;
    }

    function isImageURL(string memory str) internal pure returns (bool) {
        return contains(str, "mypinata.cloud/ipfs/");
    }

    function utfStringLength(
        string memory str
    ) internal pure returns (uint256 length) {
        uint256 i = 0;
        bytes memory strBytes = bytes(str);
        while (i < strBytes.length) {
            uint8 b = uint8(strBytes[i]);
            if (b >> 7 == 0) {
                i += 1;
            } else if (b >> 5 == 0x6) {
                i += 2;
            } else if (b >> 4 == 0xE) {
                i += 3;
            } else if (b >> 3 == 0x1E) {
                i += 4;
            } else {
                revert("Invalid UTF-8 character");
            }
            length++;
        }
    }

	
    function addTokenEntry(
        TokenRegistry storage registry,
        address sender,
        string memory _tokenName,
        string memory _emojiOrImage,
        uint256 maxNameLength,
        uint256 maxEmojiLength
    ) internal returns (bool isImage) {
        require(bytes(_tokenName).length > 0, "Please provide tokenName");
        require(
            bytes(_tokenName).length <= maxNameLength,
            "Token name too long"
        );
        require(
            !registry.isTokenNameUsed[_tokenName],
            "Token name already used"
        );
        require(
            registry.userTokenEntries[sender][_tokenName].user == address(0),
            "Token name already used by user"
        );

        isImage = isImageURL(_emojiOrImage);

        if (!isImage) {
            require(
                utfStringLength(_emojiOrImage) <= maxEmojiLength,
                "Max emoji length exceeded"
            );
        } else {
            require(bytes(_emojiOrImage).length <= 256, "URL too long");
        }

        registry.isTokenNameUsed[_tokenName] = true;
        registry.tokenNameToOwner[_tokenName] = sender;
        registry.usersTokenNames[sender].push(_tokenName);
        registry.userTokenCount[sender]++;
        registry.allTokenNames.push(_tokenName);

        registry.userTokenEntries[sender][_tokenName] = TokenEntry(
            sender,
            _tokenName,
            _emojiOrImage,
            TokenStatus.Pending
        );
    }

    function getPendingTokenNames(
        TokenRegistry storage registry,
        address user,
        uint256 maxTokens
    ) internal view returns (string[] memory result) {
        require(
            registry.userTokenCount[user] <= maxTokens,
            "Token limit exceeded"
        );
        string[] memory allTokens = registry.usersTokenNames[user];
        uint256 totalTokens = allTokens.length;
        string[] memory temp = new string[](totalTokens);
        uint256 count = 0;
        for (uint256 i = 0; i < totalTokens; i++) {
            if (
                registry.userTokenEntries[user][allTokens[i]].status ==
                TokenStatus.Pending
            ) {
                temp[count++] = allTokens[i];
            }
        }
        result = new string[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = temp[j];
        }
    }

    function getTokenEntries(
        TokenRegistry storage registry,
        uint256 start,
        uint256 limit
    ) internal view returns (TokenEntry[] memory entries) {
        uint256 end = start + limit > registry.allTokenNames.length
            ? registry.allTokenNames.length
            : start + limit;
        entries = new TokenEntry[](end - start);
        for (uint256 i = start; i < end; i++) {
            string memory tokenName = registry.allTokenNames[i];
            address user = registry.tokenNameToOwner[tokenName];
            entries[i - start] = registry.userTokenEntries[user][tokenName];
        }
    }

    function getAllTokenEntries(
        TokenRegistry storage registry
    ) internal view returns (TokenEntry[] memory) {
        return getTokenEntries(registry, 0, registry.allTokenNames.length);
    }

    function updateTokenStatus(
        TokenRegistry storage registry,
        address owner,
        string memory tokenName,
        TokenStatus newStatus
    ) internal {
        require(
            bytes(registry.userTokenEntries[owner][tokenName].tokenName)
                .length > 0,
            "Token entry not found"
        );
        registry.userTokenEntries[owner][tokenName].status = newStatus;
    }
}
