/**
 * Contains code to interact with the tzkt api.
 */

import axios from "axios";
import config from "../config";

const endpoint = {
  hangzhounet: "https://api.hangzhounet.tzkt.io",
  mainnet: "https://api.tzkt.io",
};
const currentEndpoint = endpoint[config.network];

export const fetchStorage = async (contract) => {
  const factoryStorage = await axios.get(
    `${currentEndpoint}/v1/contracts/${contract}/storage`
  );
  return factoryStorage.data;
};

export const fetchUsersCrowdsales = async (userAddress) => {
  const storage = await fetchStorage(config.factory);
  if (!Object.keys(storage.usersCrowdsales).includes(userAddress)) {
    return [];
  }
  return storage.usersCrowdsales[userAddress];
};

export const isCrowdsaleConnected = async (crowdsale) => {
  // Return true if fa2 is connected else false.
  const storage = await fetchStorage(crowdsale);
  if (storage.fa2) {
    return true;
  } else {
    return false;
  }
};

export const fa2Of = async (crowdsale) => {
  // return fa2 address corresponding to a crowdsale contract address.
  const storage = await fetchStorage(config.factory);
  if (!Object.keys(storage.crowdsales).includes(crowdsale)) {
    return null;
  }
  return storage.crowdsales[crowdsale];
};
