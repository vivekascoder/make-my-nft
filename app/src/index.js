import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { LoaderProvider } from "./hooks/useLoader";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <LoaderProvider>
        <App />
      </LoaderProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
