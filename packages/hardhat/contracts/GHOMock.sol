pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract GHOMock is ERC20 {
    constructor() ERC20('Gho Mock', 'GHO') {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
