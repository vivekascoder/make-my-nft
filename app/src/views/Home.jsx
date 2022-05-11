import CrowdsaleForm from "../components/CrowdsaleForm";
import Crowdsles from "../components/Crowdsales";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
export default function Home() {
  return (
    <>
      <div
        className="h-96 w-full"
        style={{
          backgroundImage: "url('/doodle1.jpg')",
          backgroundPosition: "center",
          backgroundSize: "100% auto",
        }}
      ></div>
      <CrowdsaleForm />
      <Link
        to="/all"
        className="max-w-2xl mx-auto flex items-center justify-between bg-red-500 p-5 rounded-md mb-10 transform transition-all hover:-translate-y-2"
      >
        <h1 className="text-2xl font-extrabold text-white">All Collections</h1>
        <FontAwesomeIcon icon={faLink} className="w-5 h-5 text-white" />
      </Link>
      <div className="max-w-2xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-700 mb-4">
            Your crowdsale contracts.
          </h1>
        </div>
        <div className="px-4">
          <Crowdsles />
        </div>
      </div>
    </>
  );
}
