import { faCartFlatbed, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import config from "../config";
import { useLoader } from "../hooks/useLoader";
import {
  fetchAllCrowdsale,
  fetchUsersCrowdsales,
  isCrowdsaleConnected,
  isCrowdsaleStarted,
} from "../utils/tzkt";
import {
  connectCrowdsaleToFA2,
  getUserAddress,
  startSale,
} from "../utils/wallet";
import { WhiteButton } from "./Button";
import toast from "react-hot-toast";

const Card = ({ address, isConnected, isStarted, name }) => {
  const { toggleShow } = useLoader();
  const handleConnect = async (address) => {
    toggleShow();
    const op = await connectCrowdsaleToFA2(address);
    toggleShow();
    toast("Transaction for starting sale is sent.");
    op.confirmation();
  };
  const handleStartSale = async (address) => {
    toggleShow();
    const op = await startSale(address);
    toggleShow();
    await op.confirmation();
  };
  return (
    <div className="relative overflow-hidden rounded-lg bg-red-500 shadow-md mr-3 mt-4 p-6">
      <div>
        <a
          className="block text-xl font-semibold text-white hover:underline"
          style={{ cursor: "cell" }}
          href={`https://better-call.dev/${
            config.network == "mainnet" ? "mainnet" : "hangzhou2net"
          }/${address}`}
          target="_blank"
        >
          {/* {address.slice(0, 4) +
            "..." +
            address.slice(address.length - 4, address.length)} */}
          {name}
        </a>
      </div>
      <div className="flex mt-4 space-x-6">
        <WhiteButton
          onClick={() => {
            handleConnect(address);
          }}
          faIcon={faPlus}
          text="Connect"
          disabled={isConnected}
        />
        <WhiteButton
          onClick={() => {
            handleStartSale(address);
          }}
          faIcon={faCartFlatbed}
          text="Start Sale"
          disabled={isStarted}
        />
      </div>
    </div>
  );
};

export default function Crowdsles() {
  const [crowdsales, setCrowdsales] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const addr = await getUserAddress();
      const data = await fetchUsersCrowdsales(addr.pkh);
      const names = await fetchAllCrowdsale();
      let c = [];
      for (let addr of data) {
        let isC = await isCrowdsaleConnected(addr);
        let isStarted = await isCrowdsaleStarted(addr);
        c.push({
          address: addr,
          isConnected: isC,
          name: names[addr],
          isStarted: isStarted,
        });
        console.log(isStarted);
      }
      setCrowdsales(c);
    }
    fetchData();
  }, []);
  return (
    <div className="">
      {crowdsales.map((crowdsale, index) => (
        <Card
          address={crowdsale.address}
          isConnected={crowdsale.isConnected}
          isStarted={crowdsale.isStarted}
          name={crowdsale.name}
          key={index}
        />
      ))}
    </div>
  );
}
