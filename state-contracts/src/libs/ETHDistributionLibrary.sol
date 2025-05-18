// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ETHDistributionLibrary {
    uint256 public constant HOLDER_SHARE = 10; // 10% holder share
    uint256 public constant LIQUIDITY_SHARE = 30; // 30% liquidity share
    uint256 public constant DEVELOPMENT_SHARE = 5; // 5% development share
    uint256 public constant REFERRAL_BONUS = 5; // 5% referral bonus

    function calculateETHDistribution(
        uint256 value,
        address sender,
        string memory referralCode,
        address governance,
        mapping(string => address) storage referralCodeToUser,
        uint256 totalSupply,
        uint256 davHoldersCount
    )
        external
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
        require(!excludeHolderShare || sender != address(0), "Invalid governance address");

        holderShare = excludeHolderShare ? 0 : (value * HOLDER_SHARE) / 100;
        liquidityShare = (value * LIQUIDITY_SHARE) / 100;
        developmentShare = (value * DEVELOPMENT_SHARE) / 100;
        referralShare = 0;
        referrer = address(0);

        if (bytes(referralCode).length > 0) {
            address _referrer = referralCodeToUser[referralCode];
            if (_referrer != address(0) && _referrer != sender) {
                referralShare = (value * REFERRAL_BONUS) / 100;
                referrer = _referrer;
            }
        }

        if (davHoldersCount == 0 || totalSupply == 0) {
            liquidityShare += holderShare;
            holderShare = 0;
        }

        uint256 distributed = holderShare + liquidityShare + developmentShare + referralShare;
        require(distributed <= value, "Over-allocation");
        stateLPShare = value - distributed;
    }
}