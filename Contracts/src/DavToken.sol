// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DAVToken is ERC20, Ownable(msg.sender), ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 5000000 ether; // 5 Million DAV Tokens
    uint256 public constant TOKEN_COST = 150000 ether; // 150,000 PLS per DAV

    uint256 public mintedSupply; // Total Minted DAV Tokens
    address public liquidityWallet; // Liquidity Wallet
    address public developmentWallet; // Development Wallet

    uint256 public totalLiquidityAllocated;
    uint256 public totalDevelopmentAllocated;

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
    ) ERC20(tokenName, TokenSymbol) {
        require(
            _liquidityWallet != address(0) && _developmentWallet != address(0),
            "Wallet addresses cannot be zero"
        );
        liquidityWallet = _liquidityWallet;
        developmentWallet = _developmentWallet;
        governanceAddress = Governance;
    }

    address private governanceAddress;

    modifier onlyGovernance() {
        require(
            msg.sender == governanceAddress,
            "Caller is not authorized (Governance)"
        );
        _;
    }

    function setGovernanceAddress(address _newGovernance)
        external
        onlyGovernance
    {
        require(
            _newGovernance != address(0),
            "New governance address cannot be zero"
        );
        governanceAddress = _newGovernance;
    }

    function viewLastMintTimeStamp(address user) public view returns (uint256) {
        return lastMintTimestamp[user];
    }

    /**
     * @dev Mint DAV tokens by paying PLS.
     * @param amount The amount of DAV tokens to mint (in wei).
     */
    function mintDAV(uint256 amount) external payable nonReentrant {
        // **Checks**
        require(amount > 0, "Amount must be greater than zero");
        require(mintedSupply + amount <= MAX_SUPPLY, "Max supply reached");

        uint256 cost = (amount / 1 ether) * TOKEN_COST;
        require(msg.value == cost, "Incorrect PLS amount sent");

        // **Effects**
        mintedSupply += amount;
        lastMintTimestamp[msg.sender] = block.timestamp; // Update the last mint timestamp for the user

        _mint(msg.sender, amount);

        // Track the user as a DAV holder
        trackDAVHolder(address(0), msg.sender);

        emit TokensMinted(msg.sender, amount, amount);

        // **Interactions**
        distributeFunds();
    }

    function distributeFunds() internal {
        // **Checks**
        require(msg.value > 0, "No funds sent for distribution");

        // **Effects**
        uint256 liquidityShare = (msg.value * 95) / 100;
        uint256 developmentShare = msg.value - liquidityShare;

        totalLiquidityAllocated += liquidityShare;
        totalDevelopmentAllocated += developmentShare;

        // **Interactions**
        (bool successLiquidity, ) = liquidityWallet.call{value: liquidityShare}(
            ""
        );
        require(successLiquidity, "Liquidity transfer failed");

        (bool successDevelopment, ) = developmentWallet.call{
            value: developmentShare
        }("");
        require(successDevelopment, "Development transfer failed");
    }

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

    function _removeHolder(address holder) internal {
        for (uint256 i = 0; i < davHolders.length; i++) {
            if (davHolders[i] == holder) {
                davHolders[i] = davHolders[davHolders.length - 1];
                davHolders.pop();
                break;
            }
        }
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._transfer(from, to, amount);
        trackDAVHolder(from, to);
    }

    function getDAVHolders() public view returns (address[] memory) {
        return davHolders;
    }

    function getDAVHoldings(address user) public view returns (uint256) {
        return balanceOf(user);
    }

    function getUserHoldingPercentage(address user)
        public
        view
        returns (uint256)
    {
        uint256 userBalance = balanceOf(user);
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            return 0;
        }
        return (userBalance * 1e18) / totalSupply; // Return percentage as a scaled value (1e18 = 100%).
    }

    function balacneETH() public view returns (uint256) {
        return address(this).balance;
    }

    function updateLiquidityWallet(address _liquidityWallet)
        external
        onlyGovernance
    {
        require(_liquidityWallet != address(0), "Invalid address");
        liquidityWallet = _liquidityWallet;
    }

    function updateDevelopmentWallet(address _developmentWallet)
        external
        onlyGovernance
    {
        require(_developmentWallet != address(0), "Invalid address");
        developmentWallet = _developmentWallet;
    }

    receive() external payable nonReentrant {}
}
