import { BurnerConnector } from "./wagmi-burner/BurnerConnector";
import { getDefaultConfig, getDefaultConnectors } from "connectkit";
import { hardhat } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { appChains } from "~~/services/web3/wagmiConnectors";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const targetNetworks = getTargetNetworks();

const metadata = {
  name: "Scaffold-ETH 2 App",
  description: "Built with 🏗 Scaffold-ETH 2",
};
const config = {
  publicClient: appChains.publicClient,
  chains: appChains.chains,
  walletConnectProjectId: scaffoldConfig.walletConnectProjectId,
  appName: "Scaffold-ETH 2",
  app: metadata,
};

const burnerConnector = new BurnerConnector({
  chains: appChains.chains.filter(chain => targetNetworks.map(({ id }) => id).includes(chain.id)),
  options: { defaultChainId: targetNetworks[0].id },
});

const connectors = [
  ...getDefaultConnectors(config),
  ...(!targetNetworks.some(network => network.id !== hardhat.id) || !scaffoldConfig.onlyLocalBurnerWallet
    ? [burnerConnector]
    : []),
];

export const wagmiConfig = createConfig(getDefaultConfig({ ...config, autoConnect: false, connectors }));
