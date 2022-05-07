import {
  connectWallet,
  getActiveAccount,
  disconnectWallet,
} from "../utils/wallet";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faImagePortrait } from "@fortawesome/free-solid-svg-icons";
import config from "../config";
import Button, { ButtonLink } from "./Button";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [wallet, setWallet] = useState(null);

  const handleConnectWallet = async () => {
    const { wallet } = await connectWallet();
    setWallet(wallet);
  };
  const handleDisconnectWallet = async () => {
    const { wallet } = await disconnectWallet();
    setWallet(wallet);
  };

  useEffect(() => {
    const func = async () => {
      const account = await getActiveAccount();
      if (account) {
        setWallet(account.address);
      }
    };
    func();
  }, []);

  return (
    <nav
      className="fixed w-full top-0 left-0 z-40"
      style={{ backgroundColor: "#f4f4f4E0", backdropFilter: "blur(12px)" }}
    >
      <div className="flex items-center px-4 sm:px-10 justify-between h-20">
        <div className="flex-1 space-x-4 flex items-center">
          <Link
            className="font-bold text-gray-900 pr-2 text-lg sm:text-2xl"
            to="/"
          >
            <FontAwesomeIcon
              icon={faImagePortrait}
              className="mr-2 text-red-500"
            />
            <span>
              Make My <span className="text-red-500">NFT</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center sm:space-x-4 space-x-2">
          <div className="sm:space-x-4 sm:block hidden">
            <ButtonLink href={config.twitter} faIcon={faTwitter} />
            <ButtonLink faIcon={faDiscord} href={config.discord} />
          </div>
          <Button
            onClick={wallet ? handleDisconnectWallet : handleConnectWallet}
            faIcon={faWallet}
            text={
              wallet
                ? wallet.slice(0, 4) +
                  "..." +
                  wallet.slice(wallet.length - 4, wallet.length)
                : "Sync"
            }
          />
        </div>
      </div>
    </nav>
  );
}
