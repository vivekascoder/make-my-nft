import Button from "./Button";
import Input from "./Input";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import { useState } from "react";
import { createCrowdsale } from "../utils/wallet";
import { useLoader } from "../hooks/useLoader";

export default function CrowdsaleForm() {
  const { toggleShow } = useLoader();
  const [maxSupply, setMaxSupply] = useState(1);
  const [presaleStartTime, setPresaleStartTime] = useState(new Date());
  const [presaleEndTime, setPresaleEndTime] = useState(new Date());
  const [publicSaleStartTime, setPublicSaleStartTime] = useState(new Date());
  const [presalePrice, setPresalePrice] = useState(0);
  const [publicsalePrice, setPublicsalePrice] = useState(0);
  const [templatePath, setTemplatePath] = useState("");
  const [presaleMintLimit, setPresaleMintLimit] = useState(1);
  const [publicsaleMintLimit, setPublicsaleMintLimit] = useState(1);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    toggleShow();
    const op = await createCrowdsale(
      name,
      description,
      parseInt(maxSupply),
      presaleEndTime.toISOString(),
      parseInt(presaleMintLimit),
      parseInt(parseFloat(presalePrice * 10 ** 6)),
      presaleStartTime.toISOString(),
      parseInt(publicsaleMintLimit),
      parseInt(parseFloat(publicsalePrice * 10 ** 6)),
      publicSaleStartTime.toISOString(),
      templatePath
    );
    toggleShow();
    op.confirmation();
  };
  return (
    <div className="bg-white rounded-lg p-6 border-2 border-gray-200 max-w-xl transform -translate-y-40 mx-auto">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold text-center mb-4">
            Create <span className="text-red-500">Crowdsale</span>
          </h1>
        </div>
        <div>
          <label
            htmlFor="name"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Name of collection
          </label>
          <Input
            type="text"
            placeholder="Collection's name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Description for collection
          </label>
          <textarea
            type="text"
            placeholder="Collection's Description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="cursor-cell rounded-2xl px-6 py-2 font-semibold ring-4 ring-gray-800 ring-opacity-10 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 w-full border-none placeholder-gray-500"
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Max Supply
          </label>
          <Input
            type="number"
            placeholder="Collection's max supply"
            name="maxSupply"
            value={maxSupply}
            onChange={(e) => setMaxSupply(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Presale Start Time
          </label>
          <Datetime
            inputProps={{
              placeholder: "Presale start time.",
              className:
                "cursor-cell rounded-2xl px-6 py-2 font-semibold ring-4 ring-gray-800 ring-opacity-10 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 w-full border-none placeholder-gray-500",
            }}
            value={presaleStartTime}
            onChange={(e) => setPresaleStartTime(e.toDate())}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Presale End Time
          </label>
          <Datetime
            inputProps={{
              placeholder: "Presale end time.",
              className:
                "cursor-cell rounded-2xl px-6 py-2 font-semibold ring-4 ring-gray-800 ring-opacity-10 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 w-full border-none placeholder-gray-500",
            }}
            value={presaleEndTime}
            onChange={(e) => setPresaleEndTime(e.toDate())}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Presale Price (XTZ)
          </label>
          <Input
            type="text"
            placeholder="Enter price in XTZ"
            name="maxSupply"
            value={presalePrice}
            onChange={(e) => setPresalePrice(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Public Sale Price (XTZ)
          </label>
          <Input
            type="text"
            placeholder="Enter price in XTZ"
            name="maxSupply"
            value={publicsalePrice}
            onChange={(e) => setPublicsalePrice(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Presale Mint Limit
          </label>
          <Input
            type="text"
            placeholder="Max. NFTs for a wallet in presale."
            name="maxSupply"
            value={presaleMintLimit}
            onChange={(e) => setPresaleMintLimit(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Template IPFS path
          </label>
          <Input
            type="text"
            placeholder="Base IPFS path."
            name="maxSupply"
            value={templatePath}
            onChange={(e) => setTemplatePath(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Public Sale Start Time
          </label>
          <Datetime
            inputProps={{
              placeholder: "Public sale start time.",
              className:
                "cursor-cell rounded-2xl px-6 py-2 font-semibold ring-4 ring-gray-800 ring-opacity-10 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 w-full border-none placeholder-gray-500",
            }}
            value={publicSaleStartTime}
            onChange={(e) => setPublicSaleStartTime(e.toDate())}
          />
        </div>
        <div>
          <label
            htmlFor="maxSupply"
            className="font-semibold text-sm text-gray-500 ml-2"
          >
            Public Sale Mint Limit
          </label>
          <Input
            type="number"
            placeholder="Max. NFTs for a wallet in public sale."
            name="maxSupply"
            value={publicsaleMintLimit}
            onChange={(e) => setPublicsaleMintLimit(e.target.value)}
          />
        </div>
        <div className="pt-5">
          <Button text={"Create"} />
        </div>
      </form>
    </div>
  );
}
