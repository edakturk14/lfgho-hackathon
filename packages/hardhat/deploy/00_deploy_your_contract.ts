import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

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

  await deploy("GhoFundStreams", {
    from: deployer,
    args: [poolMock.address, ghoMock.address],
    log: true,
    autoMine: true,
  });

  // Get GHOMock contract instance
  const ghoMockContract = await hre.ethers.getContract<Contract>("GHOMock", deployer);
  await ghoMockContract.mint(poolMock.address, 1000);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["GhoFundStreams"];
