import { useEffect, useMemo, useState } from "react";
import { Address } from "./scaffold-eth";
import { formatEther } from "viem";
import { useScaffoldContractRead, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

const BuildersInfo = () => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  const [builderList, setBuilderList] = useState<string[]>([]);

  const { data: allBuildersData, isLoading: isLoadingBuilderData } = useScaffoldContractRead({
    contractName: "GhoFundStreams",
    functionName: "allBuildersData",
    args: [builderList],
  });

  const { data: newContractWithdrawEvents, isLoading: isLoadingNewContractWithdrawEvents } = useScaffoldEventHistory({
    contractName: "GhoFundStreams",
    eventName: "Withdraw",
    fromBlock: scaffoldConfig.contracts.SandGardenStreams.fromBlock,
    blockData: true,
  });

  const { data: addBuilderEvents, isLoading: isLoadingBuilderEvents } = useScaffoldEventHistory({
    contractName: "GhoFundStreams",
    eventName: "AddBuilder",
    fromBlock: scaffoldConfig.contracts.SandGardenStreams.fromBlock,
  });

  useEffect(() => {
    if (addBuilderEvents && addBuilderEvents.length > 0) {
      const fetchedBuilderList = addBuilderEvents.map((event: any) => event.args.to);
      setBuilderList(fetchedBuilderList);
    }
  }, [addBuilderEvents]);

  const sortedWithdrawEvents = useMemo(
    () =>
      [...(newContractWithdrawEvents || [])].sort((a: any, b: any) =>
        a.block.number > b.block.number ? -1 : a.block.number < b.block.number ? 1 : 0,
      ),
    [newContractWithdrawEvents],
  );

  useEffect(() => {
    if (selectedAddress) {
      setFilteredEvents(sortedWithdrawEvents?.filter((event: any) => event.args.to === selectedAddress) || []);
    }
  }, [selectedAddress, sortedWithdrawEvents]);

  const sortedBuilders = allBuildersData && [...allBuildersData].reverse();

  console.log("All withdraw events are", sortedWithdrawEvents);

  return (
    <div className="flex flex-row space-x-3">
      {/* Builders Div */}
      <div className="flex flex-col shadow-center shadow-secondary rounded-lg p-4 border-4 border-secondary">
        <h1 className="text-2xl text-primary font-bold mb-2">Builders</h1>
        {isLoadingBuilderData || isLoadingBuilderEvents ? (
          <div className="m-4">
            <div className="text-5xl animate-bounce mb-2">👻</div>
            <div className="m-0 flex items-end space-x-1 text-lg font-bold text-primary">
              Loading
              <span className="ml-1 loading loading-dots loading-sm"></span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedBuilders?.map((builderData: any) => {
              if (builderData.GHOcap === 0n) return;
              const cap = formatEther(builderData.GHOcap || 0n);
              const unlocked = formatEther(builderData.unlockedGHOAmount || 0n);
              const percentage = Math.floor((parseFloat(unlocked) / parseFloat(cap)) * 100);
              return (
                <div className="flex flex-col md:flex-row gap-2 md:gap-6" key={builderData.builderAddress}>
                  <div className="flex flex-col md:items-center">
                    <div>
                      Ξ {parseFloat(unlocked).toFixed(4)} / {cap}
                    </div>
                    <progress
                      className="progress w-56 progress-primary bg-gray-300"
                      value={percentage}
                      max="100"
                    ></progress>
                  </div>
                  <div className="md:w-1/2 flex">
                    <label
                      htmlFor="withdraw-events-modal"
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedAddress(builderData.builderAddress);
                      }}
                    >
                      <Address address={builderData.builderAddress} disableAddressLink={true} />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contirbutions Div */}
      <div className="flex flex-grow flex-col shadow-center shadow-secondary rounded-lg p-4 border-4 border-secondary">
        <h1 className="text-2xl text-primary font-bold mb-2">Contributions</h1>
        {isLoadingBuilderData || isLoadingBuilderEvents ? (
          <div className="m-4">
            <div className="text-5xl animate-bounce mb-2">👻</div>
            <div className="m-0 flex items-end space-x-1 text-lg font-bold text-primary">
              Loading
              <span className="ml-1 loading loading-dots loading-sm"></span>
            </div>
          </div>
        ) : (
          <>
            {sortedWithdrawEvents?.length === 0 && (
              <div className="my-2">
                <p>No contributions yet!</p>
              </div>
            )}
            {sortedWithdrawEvents?.map((event: any) => {
              return (
                <div
                  className="flex flex-col gap-1 mb-6"
                  key={`${event.log.address}_${event.log.blockNumber}`}
                  data-test={`${event.log.address}_${event.log.blockNumber}`}
                >
                  <div>
                    <Address address={event.args.to} />
                  </div>
                  <div>
                    <strong>
                      {new Date(parseInt(event.block.timestamp.toString()) * 1000).toISOString().split("T")[0]}
                    </strong>
                  </div>
                  <div>
                    Ξ {formatEther(event.args.GHOamount)} / {event.args.reason}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modal logic to show individual builder contributions */}
      <input type="checkbox" id="withdraw-events-modal" className="modal-toggle" />
      <label htmlFor="withdraw-events-modal" className="modal cursor-pointer">
        <label className="modal-box relative max-w-4xl shadow shadow-primary">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-8">
            <p className="mb-1">Contributions</p>
            <Address address={selectedAddress} />
          </h3>
          <label htmlFor="withdraw-events-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <ul>
              {isLoadingNewContractWithdrawEvents ? (
                <div>
                  <div className="text-3xl animate-bounce mb-2">👻</div>
                  <div className="m-0 flex items-end space-x-1 text-lg font-bold text-primary">
                    Loading
                    <span className="ml-1 loading loading-dots loading-sm"></span>
                  </div>
                </div>
              ) : filteredEvents.length > 0 ? (
                <div className="flex flex-col">
                  {filteredEvents.map(event => (
                    <div key={event.log.transactionHash} className="flex flex-col">
                      <div>
                        <span className="font-bold">Date: </span>
                        {new Date(parseInt(event.block.timestamp.toString()) * 1000).toISOString().split("T")[0]}
                      </div>
                      <div>
                        <span className="font-bold">Amount: </span>Ξ {formatEther(event.args.GHOamount.toString())}
                      </div>
                      <div>{event.args.reason}</div>
                      <hr className="my-8" />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No contributions</p>
              )}
            </ul>
          </div>
        </label>
      </label>
    </div>
  );
};

export default BuildersInfo;
