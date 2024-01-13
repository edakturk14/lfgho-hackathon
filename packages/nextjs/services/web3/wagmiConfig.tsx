import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { appChains } from "~~/services/web3/wagmiConnectors";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    autoConnect: false,
    publicClient: appChains.publicClient,
    chains: appChains.chains,
    walletConnectProjectId: scaffoldConfig.walletConnectProjectId,
    appName: "Scaffold-ETH 2",
  }),
);
