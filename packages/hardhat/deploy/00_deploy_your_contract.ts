import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // This are sepolia addresses
  let poolAddress = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
  let ghoAddress = "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60";
  const wethGatewayAddress = "0x387d311e47e80b498169e6fb51d3193167d89F7D";

  // Check if the network is hardhat network then use mock address or else use the real address
  if (hre.network.name === "hardhat") {
    // deploy GHOMock
    const ghoMock = await deploy("GHOMock", {
      from: deployer,
      args: [],
      log: true,
      autoMine: true,
    });

    // deploy PoolMock
    const poolMock = await deploy("PoolMock", {
      from: deployer,
      args: [ghoMock.address],
      log: true,
      autoMine: true,
    });

    poolAddress = poolMock.address;
    ghoAddress = ghoMock.address;

    // Setup
    const ghoMockContract = await hre.ethers.getContract<Contract>("GHOMock", deployer);
    await ghoMockContract.mint(poolMock.address, 1000);
  }

  await deploy("GhoFundStreams", {
    from: deployer,
    args: ["0x55b9CB0bCf56057010b9c471e7D42d60e1111EEa", poolAddress, ghoAddress, wethGatewayAddress],
    log: true,
    autoMine: true,
  });
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["GhoFundStreams"];
