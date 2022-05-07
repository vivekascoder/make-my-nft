import { getContractMetadata, validateContractAddress } from "../utils/tzkt";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SaleProgressBar from "../components/SaleProgressBar";
import { MintNFT } from "../components/MintNFT";

export default function Crowdsale() {
  const { crowdsaleAddress } = useParams();
  const [isValid, setIsValid] = useState();
  const [metadata, setMetadata] = useState("");
  useEffect(() => {
    const doo = async () => {
      setMetadata(await getContractMetadata(crowdsaleAddress));
    };
    doo();
    setIsValid(validateContractAddress(crowdsaleAddress));
  }, []);
  return (
    <div className="max-w-2xl mx-auto pt-40">
      {isValid ? (
        metadata && (
          <div>
            <h1 className="font-extrabold text-center text-4xl text-gray-600 ">
              {JSON.parse(metadata).name}
            </h1>
            <p className="font-medium leading-6 text-xl mt-6 text-gray-500">
              {JSON.parse(metadata).description}
            </p>

            {/* <div className="mt-4">
              <SaleProgressBar sold={100} total={1000} load={false} />
            </div> */}
            <div className="mt-6">
              <MintNFT addr={crowdsaleAddress} />
            </div>
          </div>
        )
      ) : (
        <div className="bg-red-50 ring-4 ring-red-500 ring-opacity-30 rounded-xl p-4">
          <h1 className="font-bold text-red-500 uppercase text-center">
            Not a valid contract address
          </h1>
        </div>
      )}
    </div>
  );
}
