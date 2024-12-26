// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DAVToken is ERC20, Ownable(msg.sender) {
    uint256 public constant MAX_SUPPLY = 5000000 ether; // 5 Million DAV Tokens
    uint256 public constant TOKEN_COST = 150000 ether; // 100,000 PLS per DAV

    uint256 public mintedSupply; // Total Minted DAV Tokens
    address public liquidityWallet; // Liquidity Wallet
    address public developmentWallet; // Development Wallet

    event TokensMinted(
        address indexed user,
        uint256 davAmount,
        uint256 stateAmount
    );

    mapping(address => bool) private davHolderExists;
    mapping(address => uint256) public lastMintTimestamp; // Track the last mint timestamp for each user
    address[] private davHolders;

    constructor(
        address _liquidityWallet,
        address _developmentWallet,
        address Governance,
        string memory tokenName,
        string memory TokenSymbol
    )
        ERC20(tokenName, TokenSymbol) // ERC20("DAV Token", "DAV")
    {
        liquidityWallet = _liquidityWallet;
        developmentWallet = _developmentWallet;
        governanceAddress = Governance;
    }

    address private governanceAddress;

    // Modifier to check if the sender is the governance address
    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "You are not authorized to perform this action"
        );
        _;
    }

    function setGovernanceAddress(
        address _newGovernance
    ) public onlyGovernance {
        governanceAddress = _newGovernance;
    }

    function viewLastMintTimeStamp(address user) public view returns (uint256) {
        return lastMintTimestamp[user];
    }

    /**
     * @dev Mint DAV tokens by paying PLS.
     * @param amount The amount of DAV tokens to mint (in wei).
     */
    function mintDAV(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than zero");

        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");

        uint256 cost = (amount / 1 ether) * TOKEN_COST;
        require(msg.value == cost, "Incorrect PLS amount sent");

        // Mint DAV tokens to user
        _mint(msg.sender, amount);
        mintedSupply += amount;

        // Track the user as a DAV holder
        trackDAVHolder(address(0), msg.sender);

        // Update the last mint timestamp for the user
        lastMintTimestamp[msg.sender] = block.timestamp;

        distributeFunds();

        emit TokensMinted(msg.sender, amount, amount);
    }

    uint256 public totalLiquidityAllocated;
    uint256 public totalDevelopmentAllocated;

    function distributeFunds() internal {
        uint256 liquidityShare = (msg.value * 95) / 100;
        uint256 developmentShare = msg.value - liquidityShare;

        // Update cumulative totals
        totalLiquidityAllocated += liquidityShare;
        totalDevelopmentAllocated += developmentShare;

        // Transfer funds
        (bool successLiquidity, ) = liquidityWallet.call{value: liquidityShare}(
            ""
        );
        require(successLiquidity, "Liquidity transfer failed");

        (bool successDevelopment, ) = developmentWallet.call{
            value: developmentShare
        }("");
        require(successDevelopment, "Development transfer failed");
    }

    /**
     * @dev Internal function to track DAV holders.
     * Removes holders with a zero balance and adds new holders.
     */
    function trackDAVHolder(address from, address to) internal {
        // Remove `from` as a holder if their balance becomes zero
        if (
            from != address(0) && balanceOf(from) == 0 && davHolderExists[from]
        ) {
            davHolderExists[from] = false;
            _removeHolder(from);
        }

        // Add `to` as a holder if they are not already tracked and their balance is positive
        if (to != address(0) && !davHolderExists[to] && balanceOf(to) > 0) {
            davHolderExists[to] = true;
            davHolders.push(to);
        }
    }

    /**
     * @dev Internal function to remove a holder from the `davHolders` array.
     * @param holder The address of the holder to remove.
     */
    function _removeHolder(address holder) internal {
        for (uint256 i = 0; i < davHolders.length; i++) {
            if (davHolders[i] == holder) {
                davHolders[i] = davHolders[davHolders.length - 1];
                davHolders.pop();
                break;
            }
        }
    }

    /**
     * @dev Override `_transfer` to track holders on every transfer.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._transfer(from, to, amount);
        trackDAVHolder(from, to);
    }

    /**
     * @dev Fetch the list of all current DAV holders.
     * @return The array of DAV holder addresses.
     */
    function getDAVHolders() public view returns (address[] memory) {
        return davHolders;
    }

    /**
     * @dev Get the user's DAV token holdings in numbers.
     * @param user The address of the user.
     * @return The DAV token balance of the user.
     */
    function getDAVHoldings(address user) public view returns (uint256) {
        return balanceOf(user);
    }

    /**
     * @dev Get the user's percentage of total DAV token holdings.
     * @param user The address of the user.
     * @return The percentage of the user's holdings relative to total DAV supply.
     */
    function getUserHoldingPercentage(
        address user
    ) public view returns (uint256) {
        uint256 userBalance = balanceOf(user);
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return 0;
        }
        return (userBalance * 1e18) / totalSupply; // Return percentage as a scaled value (1e18 = 100%).
    }

    /**
     * @dev Distribute incoming PLS funds.
     */

    function balacneETH() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Update the liquidity wallet address.
     * @param _liquidityWallet The new liquidity wallet address.
     */
    function updateLiquidityWallet(
        address _liquidityWallet
    ) external onlyGovernance {
        require(_liquidityWallet != address(0), "Invalid address");
        liquidityWallet = _liquidityWallet;
    }

    /**
     * @dev Update the development wallet address.
     * @param _developmentWallet The new development wallet address.
     */
    function updateDevelopmentWallet(
        address _developmentWallet
    ) external onlyGovernance {
        require(_developmentWallet != address(0), "Invalid address");
        developmentWallet = _developmentWallet;
    }

    /**
     * @dev Fallback function to accept PLS.
     */
    receive() external payable {}
}
