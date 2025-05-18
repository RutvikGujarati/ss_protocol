// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ReferralCodeLibrary {
    // Event for referral code generation
    event ReferralCodeGenerated(address indexed user, string referralCode);

    function generateReferralCode(
        address user,
        mapping(address => uint256) storage userNonce,
        mapping(string => address) storage referralCodeToUser
    ) public returns (string memory code) {
        userNonce[user]++;
        bytes32 hash = keccak256(abi.encodePacked(user, userNonce[user]));
        code = toAlphanumericString(hash, 8);
        require(referralCodeToUser[code] == address(0), "Referral code collision");
        referralCodeToUser[code] = user;
        emit ReferralCodeGenerated(user, code);
        return code;
    }


    function toAlphanumericString(
        bytes32 hash,
        uint256 length
    ) internal pure returns (string memory) {
        bytes memory charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = charset[uint8(hash[i]) % charset.length];
        }
        return string(result);
    }

    function assignReferralCodeIfNeeded(
        address user,
        mapping(address => string) storage userReferralCode,
        mapping(address => uint256) storage userNonce,
        mapping(string => address) storage referralCodeToUser
    ) external {
        if (bytes(userReferralCode[user]).length == 0) {
            string memory code = generateReferralCode(user, userNonce, referralCodeToUser);
            userReferralCode[user] = code;
        }
    }
}