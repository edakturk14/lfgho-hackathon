pragma solidity >=0.8.0 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract PoolMock {
    IERC20 public GHO;

    constructor(address _GHO) {
        GHO = IERC20(_GHO);
    }

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) public {
        GHO.transfer(onBehalfOf, amount);
    }
}
