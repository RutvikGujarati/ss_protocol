// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 500000000000 ether; // 500 billion

    constructor(
        string memory name,
        string memory symbol,
        address _gov,
        address _swapTreasury,
        address _owner
    ) ERC20(name, symbol) Ownable(_owner) {
        require(
            _gov != address(0) && _swapTreasury != address(0),
            "Invalid address"
        );
        require(_owner != address(0), "Invalid owner address");

        uint256 onePercent = (MAX_SUPPLY * 1) / 100;
        uint256 ninetyNinePercent = MAX_SUPPLY - onePercent;

        _mint(_gov, onePercent);
        _mint(_swapTreasury, ninetyNinePercent);
    }
}
