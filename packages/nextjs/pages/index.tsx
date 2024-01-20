import { useEffect, useState } from "react";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import BuildersInfo from "~~/components/BuildersInfo";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address, Balance, EtherInput, InputBase, SIGNED_NUMBER_REGEX } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldContractWrite, useTransactor } from "~~/hooks/scaffold-eth";
import { AaveData, fetchAaveDetails } from "~~/utils/aave";
import { notification } from "~~/utils/scaffold-eth";

const Loading = () => (
  <div className="animate-pulse flex space-x-4">
    <div className="flex items-center">
      <div className="h-6 w-28 bg-slate-300 rounded"></div>
    </div>
  </div>
);

const Home: NextPage = () => {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const { data: streamContract } = useDeployedContractInfo("GhoFundStreams");
  const [aaveDetails, setAaveDetails] = useState<AaveData | undefined>();
  const [aaveDetailsLoading, setAaveDetailsLoading] = useState(true);
  const { address: connectedAddress } = useAccount();
  const { data: balanceOfGHO } = useBalance({
    address: streamContract?.address,
    token: "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60",
  });

  const handleChangeNumber = (newValue: string) => {
    if (newValue && !SIGNED_NUMBER_REGEX.test(newValue)) {
      return;
    }

    setAmount(newValue);
  };

  const { writeAsync: doWithdraw } = useScaffoldContractWrite({
    contractName: "GhoFundStreams",
    functionName: "streamWithdraw",
    args: [parseEther(amount || "0"), reason],
  });

  const donateTxn = useTransactor();

  useEffect(() => {
    const getAaveDetails = async () => {
      if (!streamContract?.address) return;
      setAaveDetailsLoading(true);
      try {
        const data = await fetchAaveDetails(streamContract?.address);
        setAaveDetails(data);
      } catch (e) {
        console.log("Error getting aave details", e);
        notification.error("Error fetching aave details");
      } finally {
        setAaveDetailsLoading(false);
      }
    };

    getAaveDetails();
  }, [streamContract?.address]);

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col flex-grow p-4 space-y-4">
        {/* DAO Contract details */}
        <div className="flex flex-col md:flex-row gap-3">
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
            <div className="flex flex-col md:flex-row gap-3">
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
                ) : (
                  <Loading />
                )}
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
                    {parseFloat(aaveDetails.formattedUserSummary.currentLoanToValue).toFixed(2)}
                  </div>
                ) : (
                  <Loading />
                )}
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
                <>
                  <div className="flex gap-1 items-center">
                    $ {parseFloat(aaveDetails.formattedUserSummary.totalCollateralUSD).toFixed(2)}
                  </div>
                </>
              ) : (
                <Loading />
              )}
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
                <>
                  <div className="flex gap-1 items-center">
                    $ {aaveDetails.formattedGhoUserData.userGhoBorrowBalance.toFixed(2)}
                  </div>
                </>
              ) : (
                <Loading />
              )}
            </div>
            <div className="flex flex-col">
              <p className="font-bold m-0 text-secondary">
                Current GHO Balance
                <span className="tooltip text-secondary font-normal" data-tip="Total GHO tokens borrowed.">
                  <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                </span>
              </p>
              {aaveDetails && !aaveDetailsLoading ? (
                <>
                  <div className="flex gap-1 items-center">
                    $ {parseFloat(balanceOfGHO ? balanceOfGHO.formatted : "0").toFixed(2)}
                  </div>
                </>
              ) : (
                <Loading />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col shadow-center shadow-secondary  rounded-lg p-3 border-4 border-secondary">
            <h1 className="text-xl text-primary font-bold">Actions</h1>
            <div className="flex flex-col md:flex-row gap-5">
              <div className="flex flex-col space-y-1">
                <p className="font-bold m-0 text-secondary">
                  Donate
                  <span
                    className="tooltip text-secondary font-normal"
                    data-tip="Supplied donation will be used as collateral and helps you earn DAO tokens which can be reddemed"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                  </span>
                </p>
                <label htmlFor="donate-modal" className="btn btn-primary btn-sm">
                  <span>Donate</span>
                </label>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="font-bold m-0 text-secondary">
                  Withdraw
                  <span
                    className="tooltip text-secondary font-normal"
                    data-tip="Withdraw GHO tokens by adding your contributions"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 inline-block ml-2" />
                  </span>
                </p>
                <label htmlFor="withdraw-modal" className="btn btn-primary btn-sm">
                  <span>Withdraw</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Builders */}
        <BuildersInfo />
      </div>

      {/* Withdraw Modal */}
      <input type="checkbox" id="withdraw-modal" className="modal-toggle" />
      <label htmlFor="withdraw-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-300 shadow shadow-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-8 text-gray-500">Withdraw from your stream</h3>
          <label htmlFor="withdraw-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6">
              <InputBase value={reason} placeholder="Reason for withdrawal" onChange={value => setReason(value)} />
              <InputBase
                value={amount}
                onChange={handleChangeNumber}
                placeholder="Withdraw amount in $"
                prefix={<span className="pl-4 -mr-2 text-accent self-center">$</span>}
              />
              <button className="btn btn-primary btn-md" onClick={() => doWithdraw()}>
                Withdraw
              </button>
            </div>
          </div>
        </label>
      </label>

      {/* Donate Modal */}
      <input type="checkbox" id="donate-modal" className="modal-toggle" />
      <label htmlFor="donate-modal" className="modal cursor-pointer">
        <label className="modal-box relative bg-base-300 shadow shadow-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-8 text-gray-500">Donate</h3>
          <label htmlFor="donate-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="flex flex-col gap-6">
              <EtherInput value={amount} onChange={value => setAmount(value)} placeholder="Donation amount" />
              <button
                className="btn btn-primary btn-md"
                onClick={async () => {
                  if (connectedAddress && streamContract?.address) {
                    await donateTxn({
                      to: streamContract?.address,
                      value: parseEther(amount),
                      account: connectedAddress,
                      chain: undefined,
                    });
                  }
                }}
              >
                Donate
              </button>
            </div>
          </div>
        </label>
      </label>
    </>
  );
};

export default Home;
