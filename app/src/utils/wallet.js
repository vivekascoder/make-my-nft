import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "../config";
import { OpKind } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { fa2Of } from "./tzkt";

const preferredNetwork = config.network;
const options = {
  name: "NFT",
  iconUrl: "https://tezostaquito.io/img/favicon.png",
  preferredNetwork: preferredNetwork,
};
const rpcURL = config.rpcURL;
const wallet = new BeaconWallet(options);

const getActiveAccount = async () => {
  return await wallet.client.getActiveAccount();
};

const connectWallet = async () => {
  const wallet = new BeaconWallet(options);

  let account = await wallet.client.getActiveAccount();

  if (!account) {
    await wallet.requestPermissions({
      network: { type: preferredNetwork },
    });
    account = await wallet.client.getActiveAccount();
  }
  return { success: true, wallet: account.address };
};

const disconnectWallet = async () => {
  const wallet = new BeaconWallet(options);

  await wallet.disconnect();
  return { success: true, wallet: null };
};

const checkIfWalletConnected = async (wallet) => {
  try {
    const activeAccount = await wallet.client.getActiveAccount();
    if (!activeAccount) {
      await connectWallet();
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const mintNFT = async (quantity, address, config) => {
  const now = new Date();
  const delta = now - config.publicSaleTime > 0;
  // const delta = true;

  const wallet = new BeaconWallet(options);
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    const tezos = new TezosToolkit(rpcURL);
    tezos.setWalletProvider(wallet);

    const contract = await tezos.wallet.at(address);

    let microTransactions = [];
    for (let i = 0; i < quantity; i++) {
      microTransactions.push({
        kind: OpKind.TRANSACTION,
        ...contract.methods.mint(i).toTransferParams(),
        amount: delta ? config.publicSalePrice : config.price,
        mutez: false,
      });
    }

    const batch = await tezos.wallet.batch(microTransactions);
    const batchOp = await batch.send();
    console.log("Operation hash:", batchOp);
    let hash = batchOp.opHash;
    await batchOp.confirmation();
    return {
      success: true,
      hash: hash,
    };
  } else {
    return {
      success: false,
    };
  }
};

export const fetchSaleStat = async (addr) => {
  const tezos = new TezosToolkit(rpcURL);
  const contract = await tezos.contract.at(addr);
  const storage = await contract.storage();
  const maxSupply = storage.maxSupply;
  const totalMinted = storage.nMinted;
  return {
    maxSupply: maxSupply.toNumber(),
    totalMinted: totalMinted.toNumber(),
  };
};
export const getUserAddress = async () => {
  const wallet = new BeaconWallet(options);
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    const tezos = new TezosToolkit(rpcURL);
    tezos.setWalletProvider(wallet);
    const pkh = await tezos.wallet.pkh();
    return {
      success: true,
      pkh: pkh,
    };
  } else {
    return {
      success: false,
    };
  }
};

export const connectCrowdsaleToFA2 = async (crowdsaleAddress) => {
  const fa2 = await fa2Of(crowdsaleAddress);
  const wallet = new BeaconWallet(options);
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    const tezos = new TezosToolkit(rpcURL);
    tezos.setWalletProvider(wallet);
    const fa2Contract = await tezos.wallet.at(fa2);
    const crowdsaleContract = await tezos.wallet.at(crowdsaleAddress);
    const batch = await tezos.wallet.batch([
      {
        kind: OpKind.TRANSACTION,
        ...crowdsaleContract.methods.registerFA2(fa2).toTransferParams(),
      },
      {
        kind: OpKind.TRANSACTION,
        ...fa2Contract.methods
          .whitelist_address(crowdsaleAddress)
          .toTransferParams(),
      },
    ]);
    const batchOp = await batch.send();
    console.log(batchOp.opHash);
    return batchOp;
  }
};

export const startSale = async (crowdsale) => {
  const wallet = new BeaconWallet(options);
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    const tezos = new TezosToolkit(rpcURL);
    tezos.setWalletProvider(wallet);

    const contract = await tezos.wallet.at(crowdsale);
    const op = contract.methods.startSale().send();
    console.log(op.opHash);
    return op;
  }
};

export const createCrowdsale = async (
  name,
  description,
  maxSupply,
  presaleEnd,
  presaleMintLimit,
  presalePrice,
  presaleStart,
  publicsaleMintLimit,
  publicsalePrice,
  publicsaleStart,
  templateIPFSPath
) => {
  /**
  parameter pair
    _maxSupply nat
    _metadata bytes
    _presaleEnd timestamp
    _presaleMintLimit nat
    _presalePrice mutez
    _presaleStart timestamp
    _publicsaleMintLimit nat
    _publicsalePrice mutez
    _publicsaleStart timestamp
    _templateIPFSPath string
   */
  const metadata = char2Bytes(
    JSON.stringify({
      name: name,
      description: description,
      version: "1.0.0",
      homepage: `https://makemynft.vivek.biz/`,
    })
  );
  console.log("This is going to be metadata: ", metadata);
  const wallet = new BeaconWallet(options);
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    const tezos = new TezosToolkit(rpcURL);
    tezos.setWalletProvider(wallet);
    const contract = await tezos.wallet.at(config.factory);
    const op = contract.methods
      .createCrowdsale(
        maxSupply,
        metadata,
        name,
        presaleEnd,
        presaleMintLimit,
        presalePrice,
        presaleStart,
        publicsaleMintLimit,
        publicsalePrice,
        publicsaleStart,
        templateIPFSPath
      )
      .send({ amount: config.creationAmount, mutez: false });
    console.log(op);
    return op;
  }
};

export {
  connectWallet,
  disconnectWallet,
  getActiveAccount,
  checkIfWalletConnected,
};
