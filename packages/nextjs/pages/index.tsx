import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import BuildersInfo from "~~/components/BuildersInfo";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { AaveData, fetchAaveDetails } from "~~/utils/aave";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { data: streamContract } = useDeployedContractInfo("SandGardenStreams");
  const [aaveDetails, setAaveDetails] = useState<AaveData | undefined>();
  const [aaveDetailsLoading, setAaveDetailsLoading] = useState(true);

  useEffect(() => {
    const getAaveDetails = async () => {
      setAaveDetailsLoading(true);
      try {
        const data = await fetchAaveDetails();
        setAaveDetails(data);
      } catch (e) {
        console.log("Error getting aave details", e);
        notification.error("Error fetching aave details");
      } finally {
        setAaveDetailsLoading(false);
      }
    };

    getAaveDetails();
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
        <div className="flex space-x-3">
          {/* DAO Contract details */}
          <div className="flex flex-col shadow-center shadow-secondary  rounded-lg p-3 border-4 border-secondary">
            <h1 className="text-xl text-primary font-bold">Details</h1>
            <div className="flex flex-col">
              <p className="font-bold m-0 text-secondary">
                Stream Contract
                <span
                  className="tooltip text-secondary font-normal"
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

          {/* Status */}
          <div className="flex flex-col shadow-center shadow-secondary  rounded-lg p-3 border-4 border-secondary">
            <h1 className="text-xl text-primary font-bold">Status</h1>
            <div className="flex flex-row space-x-3">
              <div className="flex flex-col">
                <p className="font-bold m-0 text-secondary">
                  Health Factor
                  <span
                    className="tooltip text-secondary font-normal"
                    data-tip="Your health factor and loan to value determine the assurance of your collateral. To avoid liquidations you can supply more collateral or repay borrow positions."
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                  </span>
                </p>
                {aaveDetails && !aaveDetailsLoading ? (
                  <div className="flex gap-1 items-center">
                    {parseFloat(aaveDetails.formattedUserSummary.healthFactor).toFixed(2)}%
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col">
                <p className="font-bold m-0 text-secondary">
                  LTV
                  <span
                    className="tooltip text-secondary font-normal"
                    data-tip="Your health factor and loan to value determine the assurance of your collateral. To avoid liquidations you can supply more collateral or repay borrow positions."
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                  </span>
                </p>
                {aaveDetails && !aaveDetailsLoading ? (
                  <div className="flex gap-1 items-center">
                    {parseFloat(aaveDetails.formattedUserSummary.currentLoanToValue).toFixed(2)}%
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Collateral */}
          <div className="flex flex-col shadow-center shadow-secondary  rounded-lg p-3 border-4 border-secondary">
            <h1 className="text-xl text-primary font-bold">Collateral</h1>
            <div className="flex flex-col">
              <p className="font-bold m-0 text-secondary">
                Total Collateral in USD
                <span
                  className="tooltip text-secondary font-normal"
                  data-tip="Your staked collateral is used to secure your borrow positions."
                >
                  <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                </span>
              </p>
              {aaveDetails && !aaveDetailsLoading ? (
                <div className="flex gap-1 items-center">
                  $ {parseFloat(aaveDetails.formattedUserSummary.totalCollateralUSD).toFixed(2)}
                </div>
              ) : null}
            </div>
          </div>

          {/* Borrowed GHO */}
          <div className="flex flex-col shadow-center shadow-secondary  rounded-lg p-3 border-4 border-secondary">
            <h1 className="text-xl text-primary font-bold">Borrowed GHO</h1>
            <div className="flex flex-col">
              <p className="font-bold m-0 text-secondary">
                Total Borrowed GHO
                <span className="tooltip text-secondary font-normal" data-tip="Total GHO tokens borrowed.">
                  <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                </span>
              </p>
              {aaveDetails && !aaveDetailsLoading ? (
                <div className="flex gap-1 items-center">
                  $ {aaveDetails.formattedGhoUserData.userGhoBorrowBalance.toFixed(2)}
                </div>
              ) : null}
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
