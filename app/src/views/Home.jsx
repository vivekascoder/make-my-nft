import CrowdsaleForm from "../components/CrowdsaleForm";
import Crowdsles from "../components/Crowdsales";

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
