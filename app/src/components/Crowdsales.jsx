import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import config from "../config";
import { fetchUsersCrowdsales, isCrowdsaleConnected } from "../utils/tzkt";
import { connectCrowdsaleToFA2, getUserAddress } from "../utils/wallet";
import { WhiteButton } from "./Button";

const Card = ({ address, isConnected }) => {
  const handleConnect = async (address) => {
    await connectCrowdsaleToFA2(address);
  };
  return (
    <div className="relative h-40 w-60 overflow-hidden rounded-lg bg-red-500 shadow-md mr-3 mt-4">
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

        {!isConnected && (
          <div className="flex justify-center mt-4">
            <WhiteButton
              onClick={() => {
                handleConnect(address);
              }}
              faIcon={faPlus}
              text="Connect"
            />
          </div>
        )}
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
        console.log(isC, addr);
        c.push({
          address: addr,
          isConnected: isC,
        });
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
          key={index}
        />
      ))}
    </div>
  );
}
