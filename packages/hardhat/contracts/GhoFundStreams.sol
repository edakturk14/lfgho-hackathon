//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PoolMock} from "./PoolMock.sol";

// ToDo. Access control.
// ToDo. GHO integration
contract GhoFundStreams {
	IPool public aavePool;
	IERC20 public GHO;

	struct BuilderStreamInfo {
		uint256 GHOcap;
		uint256 last;
	}
	mapping(address => BuilderStreamInfo) public streamedBuilders;
	uint256 public frequency = 2592000; // 30 days

	// Events
	event Withdraw(address indexed to, uint256 GHOamount, string reason);
	event AddBuilder(address indexed to, uint256 GHOamount);
	event UpdateBuilder(address indexed to, uint256 GHOamount);

    constructor(address _aavePoolAddress, address _GHOAddress) {
		aavePool = IPool(_aavePoolAddress);
		GHO = IERC20(_GHOAddress);
	}


	// Get all builder data at once.
	struct BuilderData {
		address builderAddress;
		uint256 GHOcap;
		uint256 unlockedGHOAmount;
	}
	function allBuildersData(address[] memory _builders) public view returns (BuilderData[] memory) {
		BuilderData[] memory result = new BuilderData[](_builders.length);
		for (uint256 i = 0; i < _builders.length; i++) {
			address builderAddress = _builders[i];
			BuilderStreamInfo storage builderStream = streamedBuilders[builderAddress];
			result[i] = BuilderData(builderAddress, builderStream.GHOcap, unlockedBuilderAmount(builderAddress));
		}
		return result;
	}

	// Available amount of GHO for a builder.
	function unlockedBuilderAmount(address _builder) public view returns (uint256) {
		BuilderStreamInfo memory builderStream = streamedBuilders[_builder];
		if (builderStream.GHOcap == 0) {
			return 0;
		}

		if (block.timestamp - builderStream.last > frequency) {
			return builderStream.GHOcap;
		}

		return (builderStream.GHOcap * (block.timestamp - builderStream.last)) / frequency;
	}

	function streamWithdraw(uint256 _GHOamount, string memory _reason) public {
		// ToDo. Check that we have enough GHO?
		BuilderStreamInfo storage builderStream = streamedBuilders[msg.sender];
		require(builderStream.GHOcap > 0, "No active stream for builder");

		uint256 totalAmountCanWithdraw = unlockedBuilderAmount(msg.sender);
		require(totalAmountCanWithdraw >= _GHOamount, "Not enough unlocked GHO in the stream");

		uint256 cappedLast = block.timestamp - frequency;
		if (builderStream.last < cappedLast){
			builderStream.last = cappedLast;
		}

		builderStream.last = builderStream.last + ((block.timestamp - builderStream.last) * _GHOamount / totalAmountCanWithdraw);

		GHO.transfer(msg.sender, _GHOamount);

		emit Withdraw(msg.sender, _GHOamount, _reason);
	}

	// ToDo. Add access control.
	function addBuilderStream(address payable _builder, uint256 _GHOcap) public {
		streamedBuilders[_builder] = BuilderStreamInfo(_GHOcap, block.timestamp - frequency);
		emit AddBuilder(_builder, _GHOcap);
	}

	// ToDo. Add access control.
	function addBuilderStreamBatch(address[] memory _builders, uint256[] memory _GHOcaps) public {
		require(_builders.length == _GHOcaps.length, "Lengths are not equal");
		for (uint256 i = 0; i < _builders.length; i++) {
			addBuilderStream(payable(_builders[i]), _GHOcaps[i]);
		}
	}

	// ToDo. Add access control.
	function borrowGHO(uint256 _GHOamount) public {
		// Supply first? ETH from contract or payable?
		IPool(aavePool).borrow(address(GHO), _GHOamount, 1, 0, address(this));
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
