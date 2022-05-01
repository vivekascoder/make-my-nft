import Navbar from "./components/Navbar";
import CrowdsaleForm from "./components/CrowdsaleForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="min-h-screen" style={{ background: "#f4f4f4" }}>
      <Navbar />
      <ToastContainer />

      <div
        className="h-96 w-full"
        style={{
          backgroundImage: "url('/doodle1.jpg')",
          backgroundPosition: "center",
          backgroundSize: "100% auto",
        }}
      ></div>
      <div>
        <CrowdsaleForm />
      </div>
      {/* <div className="container mx-auto">
        <div className="flex justify-center">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-300 to-red-400">
            Hello, world!
          </h1>
        </div>
        <div className="mt-20 flex justify-center">
          <ChangeName />
        </div>
      </div> */}
    </div>
  );
};

export default App;
