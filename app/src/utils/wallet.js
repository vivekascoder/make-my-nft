import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "../config";
import { OpKind } from "@taquito/taquito";
import { char2Bytes } from "@taquito/utils";
import { toast } from "react-toastify";

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
  console.log(config);
  console.log("Hello Connecting wallet.");

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

export const mintNFT = async (quantity) => {
  const now = new Date();
  const delta = now - config.publicSaleTime > 0;
  // const delta = true;

  const wallet = new BeaconWallet(options);
  const response = await checkIfWalletConnected(wallet);
  if (response.success) {
    const tezos = new TezosToolkit(rpcURL);
    tezos.setWalletProvider(wallet);

    const contract = await tezos.wallet.at(config.contractAddress);

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

export const fetchSaleStat = async () => {
  const tezos = new TezosToolkit(rpcURL);
  const contract = await tezos.contract.at(config.contractAddress);
  const storage = await contract.storage();
  const maxSupply = storage.maxSupply;
  const totalMinted = storage.nMinted;
  return {
    maxSupply: maxSupply.toNumber(),
    totalMinted: totalMinted.toNumber(),
  };
};

export const createCrowdsale = async (
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
      name: "Mekatron Crowdsale Contract",
      description:
        "Mekatron: We are the Mekatrons, A series of Hand Designed K9 NFTs used for battle. Collect them and be ready for the battle of the Mekatrons.",
      version: "1.0.0",
      homepage: "https://mekatron.club",
    })
  );
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
    await op.confirmation();
    toast("Crowdsale created!");
  }
};

export {
  connectWallet,
  disconnectWallet,
  getActiveAccount,
  checkIfWalletConnected,
};
