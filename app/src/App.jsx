import Navbar from "./components/Navbar";
import CrowdsaleForm from "./components/CrowdsaleForm";
import Crowdsles from "./components/Crowdsales";
import Loader from "./components/Loader";
import toast, { Toaster } from "react-hot-toast";
const notify = () => toast("Here is your toast.");

const App = () => {
  return (
    <div className="min-h-screen" style={{ background: "#f4f4f4" }}>
      <Navbar />
      <Loader />
      <Toaster />

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
    </div>
  );
};

export default App;
