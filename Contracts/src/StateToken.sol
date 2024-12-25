// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {DAVToken} from "./DavToken.sol";

contract RatioSwapToken is ERC20, Ownable(msg.sender) {
    DAVToken public davToken;
    uint256 public constant MAX_SUPPLY = 999000000000000 ether;

    uint256 public totalBurned;
    uint256 public constant REWARD_DECAY_START = 1735070950; // Timestamp for 01/01/2025
    uint256 public constant DAILY_DECAY_PERCENT = 1; // 1% per day

    mapping(address => uint256) public claimableTokens;
    mapping(address => uint256) public userRewardAmount;
    mapping(address => uint256) public mintedAmount;
    mapping(address => uint256) public lastDavHolding;
    mapping(address => uint256) public lastMintTimestamp;

    event Claimed(address indexed claimant, uint256 amount);

    address public governanceAddress =
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    constructor(
        address _davTokenAddress,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        davToken = DAVToken(payable(_davTokenAddress));
    }

    function getDavRankScaled(address user) public view returns (uint256) {
        uint256 currentDavHolding = davToken.balanceOf(user);
        require(currentDavHolding > 0, "You must hold some DAV tokens");
        return currentDavHolding / 5000000;
    }

    function getCalculationOfReward(
        address user
    ) public view returns (uint256) {
        uint256 holdingRank = getDavRankScaled(user);
        require(holdingRank > 0, "Insufficient rank for reward");

        uint256 totalAmountToDistribute = (MAX_SUPPLY * 200) / 1000;
        uint256 userReward = (holdingRank * totalAmountToDistribute) / 1e20;

        require(
            userReward <= totalAmountToDistribute,
            "User reward exceeds limit"
        );

        return userReward;
    }

    function distributeRewardForUser(address user) public {
        uint256 currentDavHolding = davToken.balanceOf(user);
        require(
            currentDavHolding > lastDavHolding[user],
            "No additional DAV tokens added"
        );

        uint256 userReward = getCalculationOfReward(user);
        require(userReward > 0, "No reward available");

        // Apply decay if the user has received rewards before
        uint256 lastMintTime = lastMintTimestamp[user];
        if (lastMintTime > 0) {
            uint256 adjustedUserReward = getCurrentReward(
                userReward,
                lastMintTime
            );
            userRewardAmount[user] = adjustedUserReward; // Update the reward mapping with the decremented value
        } else {
            userRewardAmount[user] = userReward; // Set the reward without decay for the first time
        }

        // Update lastDavHolding and lastMintTimestamp for the user
        lastDavHolding[user] = currentDavHolding;
        lastMintTimestamp[user] = block.timestamp; // Reset mint timestamp after distribution
    }

    function getCurrentReward(
        uint256 baseReward,
        uint256 davMintTimestamp
    ) public view returns (uint256) {
        if (davMintTimestamp == 0 || block.timestamp < REWARD_DECAY_START) {
            return baseReward; // No decay if no DAV tokens were minted or before reward decay start
        }

        // Calculate the number of days since the user's last DAV mint
        uint256 daysSinceDavMint = (block.timestamp - davMintTimestamp) /
            1 days;

        // Apply decay for each day since the last mint
        uint256 adjustedReward = baseReward;
        for (uint256 i = 0; i < daysSinceDavMint; i++) {
            adjustedReward =
                (adjustedReward * (100 - DAILY_DECAY_PERCENT)) /
                100;
        }

        return adjustedReward;
    }

    function mintReward() public {
        uint256 userReward = userRewardAmount[msg.sender];
        require(userReward > 0, "No reward to mint");

        uint256 userDavHoldings = davToken.balanceOf(msg.sender);
        require(userDavHoldings > 0, "User has no DAV holdings");

        uint256 davMintTimestamp = davToken.viewLastMintTimeStamp(msg.sender);

        // Get the adjusted reward after decay (if applicable)
        uint256 adjustedUserReward = getCurrentReward(
            userReward,
            davMintTimestamp
        );
        uint256 baseContractMint = userDavHoldings * 1e9;

        // Mint rewards
        mintedAmount[msg.sender] = adjustedUserReward;
        _mint(msg.sender, adjustedUserReward);
        _mint(address(this), baseContractMint);

        // Reset rewards and update timestamps
        userRewardAmount[msg.sender] = 0;
        lastMintTimestamp[msg.sender] = block.timestamp;
    }

    // View function to check claimable tokens for a user
    function viewClaimableTokens(
        address holder
    ) external view returns (uint256) {
        return userRewardAmount[holder];
    }

    // View function to show both non-decremented and decremented rewards
    function viewMintableAmountWithDetails(
        address user
    )
        public
        view
        returns (uint256 nonDecrementedReward, uint256 decrementedReward)
    {
        uint256 userReward = userRewardAmount[user];
        require(userReward > 0, "No reward to view");

        uint256 davMintTimestamp = davToken.viewLastMintTimeStamp(user);

        // Calculate Rewards
        nonDecrementedReward = userReward;
        decrementedReward = getCurrentReward(userReward, davMintTimestamp);
        return (nonDecrementedReward, decrementedReward);
    }
}
