// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZITEToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 10억 개
    
    constructor(address initialOwner) ERC20("ZITE", "ZITE") Ownable(initialOwner) {
        // 초기 공급량을 배포자에게 발행
        _mint(initialOwner, MAX_SUPPLY);
    }
    
    // 추가 발행 함수 (필요시)
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
    
    // 소각 함수
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
