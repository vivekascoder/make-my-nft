/**
 * Contains code to interact with the tzkt api.
 */

import { bytes2Char } from "@taquito/utils";
import axios from "axios";
import config from "../config";

const endpoint = {
  hangzhounet: "https://api.hangzhounet.tzkt.io",
  mainnet: "https://api.tzkt.io",
  ithacanet: "https://api.ithacanet.tzkt.io",
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

export const isCrowdsaleStarted = async (crowdsale) => {
  // Return true is sale started else false.
  const storage = await fetchStorage(crowdsale);
  if (storage.saleStarted) {
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

export const validateContractAddress = (addr) => {
  if (!addr.startsWith("KT1")) return false;
  if (addr.length < 36) return false;
  return true;
};

export const getContractMetadata = async (addr) => {
  const storage = await fetchStorage(addr);
  const metadataBigMapId = storage.metadata;
  const content = await axios.get(
    `${currentEndpoint}/v1/bigmaps/${metadataBigMapId}/keys?limit=10000`
  );
  console.log("content", content);

  const obj = content.data.find((o) => o.key == "content");
  if (!obj) {
    return false;
  }
  console.log("Value", bytes2Char(obj.value));
  return bytes2Char(obj.value);
};

export const fetchCrowdsaleConfig = async (addr) => {
  const storage = await fetchStorage(addr);
  const config = {
    publicSaleTime: new Date(storage.publicsaleStart),
    publicSalePrice: parseInt(storage.publicsalePrice) / 10 ** 6,
    price: parseInt(storage.presalePrice) / 10 ** 6,
    publicsaleLimit: parseInt(storage.publicsaleMintLimit),
    presaleLimit: parseInt(storage.presaleMintLimit),
  };
  console.log(config.publicsaleLimit, config.presaleLimit);
  return config;
};

export const fetchAllCrowdsale = async () => {
  const storage = await fetchStorage(config.factory);
  return storage.crowdsaleNames;
};
