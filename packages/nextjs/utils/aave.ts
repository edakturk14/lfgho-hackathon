import { ChainId, GhoService, UiIncentiveDataProvider, UiPoolDataProvider } from "@aave/contract-helpers";
import {
  formatGhoReserveData,
  formatGhoUserData,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  formatUserSummaryWithDiscount,
} from "@aave/math-utils";
import * as markets from "@bgd-labs/aave-address-book";
import dayjs from "dayjs";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";

const USD_DECIMALS = 6;

// Sample RPC address for querying ETH goerli
const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.public.blastapi.io");

// User address to fetch data for, insert address here
const currentAccount = "0x55b9CB0bCf56057010b9c471e7D42d60e1111EEa";

// View contract used to fetch all reserves data (including market base currency data), and user reserves
// Using Aave V3 Eth goerli address for demo
const poolDataProviderContract = new UiPoolDataProvider({
  uiPoolDataProviderAddress: markets.AaveV3Sepolia.UI_POOL_DATA_PROVIDER, // Sepolia GHO Market
  provider,
  chainId: ChainId.sepolia,
});
const currentTimestamp = dayjs().unix();

// View contract used to fetch all reserve incentives (APRs), and user incentives
// Using Aave V3 Eth goerli address for demo
const incentiveDataProviderContract = new UiIncentiveDataProvider({
  uiIncentiveDataProviderAddress: markets.AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER, // Sepolia GHO Market
  provider,
  chainId: ChainId.sepolia,
});

const ghoService = new GhoService({
  provider,
  uiGhoDataProviderAddress: markets.AaveV3Sepolia.UI_GHO_DATA_PROVIDER, // Sepolia GHO Market
});

export async function fetchContractData() {
  // Object containing array of pool reserves and market base currency data
  // { reservesArray, baseCurrencyData }
  const reserves = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER, // Goerli GHO Market
  });

  // Object containing array or users aave positions and active eMode category
  // { userReserves, userEmodeCategoryId }
  const userReserves = await poolDataProviderContract.getUserReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER, // Goerli GHO Market
    user: currentAccount,
  });

  // Array of incentive tokens with price feed and emission APR
  const reserveIncentives = await incentiveDataProviderContract.getReservesIncentivesDataHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER, // Goerli GHO Market
  });

  // Dictionary of claimable user incentives
  const userIncentives = await incentiveDataProviderContract.getUserReservesIncentivesDataHumanized({
    lendingPoolAddressProvider: markets.AaveV3Sepolia.POOL_ADDRESSES_PROVIDER, // Goerli GHO Market
    user: currentAccount,
  });

  const ghoReserveData = await ghoService.getGhoReserveData();
  const ghoUserData = await ghoService.getGhoUserData(currentAccount);

  const formattedGhoReserveData = formatGhoReserveData({
    ghoReserveData,
  });
  const formattedGhoUserData = formatGhoUserData({
    ghoReserveData,
    ghoUserData,
    currentTimestamp,
  });

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves: reserves.reservesData,
    currentTimestamp,
    marketReferenceCurrencyDecimals: reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: reserveIncentives,
  });

  const userSummary = formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd: reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals: reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves: userReserves.userReserves,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userReserves.userEmodeCategoryId,
    reserveIncentives: reserveIncentives,
    userIncentives: userIncentives,
  });

  let formattedUserSummary = userSummary;
  // Factor discounted GHO interest into cumulative user fields
  if (formattedGhoUserData.userDiscountedGhoInterest > 0) {
    const userSummaryWithDiscount = formatUserSummaryWithDiscount({
      userGhoDiscountedInterest: formattedGhoUserData.userDiscountedGhoInterest,
      user: formattedUserSummary,
      marketReferenceCurrencyPriceUSD: Number(
        formatUnits(reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd, USD_DECIMALS),
      ),
    });
    formattedUserSummary = {
      ...userSummary,
      ...userSummaryWithDiscount,
    };
  }

  console.log({
    formattedGhoReserveData,
    formattedGhoUserData,
    formattedPoolReserves,
    formattedUserSummary,
  });
}
