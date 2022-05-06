import { faCartFlatbed, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import config from "../config";
import { useLoader } from "../hooks/useLoader";
import {
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

const Card = ({ address, isConnected, isStarted }) => {
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
    <div className="relative h-48 w-60 overflow-hidden rounded-lg bg-red-500 shadow-md mr-3 mt-4">
      <div className="absolute top-0 left-0 right-0 p-2 mt-5">
        <div>
          <a
            className="block text-center text-xl font-semibold text-white hover:underline"
            style={{ cursor: "cell" }}
            href={`https://better-call.dev/${
              config.network == "mainnet" ? "mainnet" : "hangzhou2net"
            }/${address}`}
            target="_blank"
          >
            {address.slice(0, 4) +
              "..." +
              address.slice(address.length - 4, address.length)}
          </a>
        </div>
        <div className="flex mt-4">
          {!isConnected && (
            <WhiteButton
              onClick={() => {
                handleConnect(address);
              }}
              faIcon={faPlus}
              text="Connect"
            />
          )}
        </div>
        <div className="flex mt-4">
          {!isStarted && (
            <WhiteButton
              onClick={() => {
                handleStartSale(address);
              }}
              faIcon={faCartFlatbed}
              text="Start Sale"
            />
          )}
        </div>
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
      let c = [];
      for (let addr of data) {
        let isC = await isCrowdsaleConnected(addr);
        let isStarted = await isCrowdsaleStarted(addr);
        c.push({
          address: addr,
          isConnected: isC,
          isStarted: isStarted,
        });
        console.log(isStarted);
      }
      setCrowdsales(c);
    }
    fetchData();
  }, []);
  return (
    <div className="flex flex-wrap items-center">
      {crowdsales.map((crowdsale, index) => (
        <Card
          address={crowdsale.address}
          isConnected={crowdsale.isConnected}
          isStarted={crowdsale.isStarted}
          key={index}
        />
      ))}
    </div>
  );
}
