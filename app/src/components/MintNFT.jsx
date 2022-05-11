import { mintNFT, fetchSaleStat } from "../utils/wallet";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import Slider from "./Slider";
import { useState, useEffect } from "react";
import SaleProgressBar from "./SaleProgressBar";
import Button from "./Button";
import { fetchCrowdsaleConfig } from "../utils/tzkt";

export const MintNFT = ({ addr }) => {
  const now = new Date();
  const [delta, setDelta] = useState(false);
  const [sliderValue, setSliderValue] = useState(1);
  const [config, setConfig] = useState({});
  const [stat, setStat] = useState({ maxSupply: 0, totalMinted: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setConfig(await fetchCrowdsaleConfig(addr));
      setDelta(now - config.publicSaleTime > 0);
      const fetchedStat = await fetchSaleStat(addr);
      console.log(`Fetching ....`);
      setStat(fetchedStat);
      setIsLoading(false);
    }
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const mintHandler = async (quantity) => {
    console.log(`Trying to mint ${quantity} NFTs`);
    const { hash } = await mintNFT(quantity, addr, config);
    notify(hash);
  };
  return (
    <div className="bg-white rounded-md shadow-lg p-5">
      {/* <h1 className="font-bold text-3xl sm:text-5xl mb-5 text-blue-400">
        Mint your NFTs
      </h1> */}
      <p className="font-medium leading-6 text-xl mb-4 text-gray-500">
        Slide the slider to select the number of NFTs to mint.
      </p>
      <div className="flex flex-col items-stretch md:flex-row md:space-x-4 space-x-0">
        <div className="mx-auto">
          {/* <img src="/placeholder.jpeg" alt="Placeholder" className="w-40" /> */}
        </div>
        <div className="flex-1">
          <div className="my-2">
            <SaleProgressBar
              sold={stat.totalMinted}
              total={stat.maxSupply}
              load={isLoading}
            />
          </div>
          <div className="pt-4 pb-10">
            <Slider
              value={sliderValue}
              onChange={(e) => setSliderValue(e.target.value)}
              min={1}
              max={delta ? config.presaleLimit : config.publicsaleLimit}
            />
          </div>

          <div className="order-last flex flex-col sm:flex-row space-y-10 sm:space-y-0 items-start sm:items-center justify-between md:space-x-10">
            <Button
              faIcon={faWallet}
              text={"Mint Now"}
              onClick={() => {
                mintHandler(sliderValue);
              }}
            />

            <span className="paragraph text-gray-600 text-left">
              Mint{" "}
              <span className="text-2xl font-semibold">{sliderValue} NFT</span>{" "}
              for{" "}
              <span className="text-2xl font-semibold">
                {sliderValue * (delta ? config.price : config.publicSalePrice)}{" "}
                ꜩ
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
