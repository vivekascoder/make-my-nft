import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { LoaderProvider } from "./hooks/useLoader";

ReactDOM.render(
  <React.StrictMode>
    <LoaderProvider>
      <App />
    </LoaderProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
