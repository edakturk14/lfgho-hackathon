import { useEffect } from "react";
import type { NextPage } from "next";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import BuildersInfo from "~~/components/BuildersInfo";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { fetchContractData } from "~~/utils/aave";

const Home: NextPage = () => {
  const { data: streamContract } = useDeployedContractInfo("SandGardenStreams");

  useEffect(() => {
    fetchContractData();
  }, []);

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col flex-grow p-4 space-y-4">
        {/* Welcome*/}
        <div>
          <h1 className="text-3xl text-primary font-bold underline underline-offset-8">Welcome to DAO !</h1>
        </div>
        {/* DAO Contract details */}
        <div className="flex flex-col shadow-center shadow-secondary  rounded-lg p-3 border-4 border-secondary">
          <h1 className="text-2xl text-primary font-bold">Details</h1>
          <div className="flex flex-col">
            <p className="font-bold m-0 text-secondary">
              Stream Contract
              <span
                className="tooltip text-white font-normal"
                data-tip="All streams and contributions are handled by a contract on Optimism"
              >
                <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
              </span>
            </p>
            <div className="flex gap-1 items-center">
              <div className="flex flex-col items-center">
                <Address address={streamContract?.address} />
              </div>{" "}
              /
              <Balance address={streamContract?.address} className="text-lg" />
            </div>
          </div>
        </div>
        {/* Builders */}
        <BuildersInfo />
      </div>
    </>
  );
};

export default Home;
