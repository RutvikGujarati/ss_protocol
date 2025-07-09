// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ReferralCodeLib {
    struct ReferralData {
        mapping(address => uint256) userNonce;
        mapping(string => address) referralCodeToUser;
        mapping(address => string) userReferralCode;
    }

    event ReferralCodeGenerated(address indexed user, string code);

    function assignReferralCodeIfNeeded(
        ReferralData storage data,
        address user
    ) internal {
        if (bytes(data.userReferralCode[user]).length == 0) {
            string memory code = generateReferralCode(data, user);
            data.userReferralCode[user] = code;
            emit ReferralCodeGenerated(user, code);
        }
    }

    function generateReferralCode(
        ReferralData storage data,
        address user
    ) internal returns (string memory code) {
        data.userNonce[user]++;
        uint256 maxAttempts = 10;
        for (uint256 i = 0; i < maxAttempts; i++) {
            bytes32 hash = keccak256(
                abi.encodePacked(
                    user,
                    data.userNonce[user],
                    i,
                    block.timestamp,
                    block.prevrandao,
                    gasleft()
                )
            );
            code = toAlphanumericString(hash, 8);
            if (data.referralCodeToUser[code] == address(0)) {
                data.referralCodeToUser[code] = user;
                return code;
            }
        }
        revert("Unable to generate unique referral code");
    }

    function toAlphanumericString(
        bytes32 hash,
        uint256 length
    ) internal pure returns (string memory) {
        bytes
            memory charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = charset[uint8(hash[i]) % charset.length];
        }
        return string(result);
    }
}
