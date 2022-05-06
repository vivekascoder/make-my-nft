/**
 * A hook to control the loader screen.
 */
import { createContext, useContext, useState } from "react";

const LoaderContext = createContext(false);
export const LoaderProvider = (props) => {
  const [show, setShow] = useState(false);
  const toggleShow = () => {
    setShow((s) => !s);
  };
  return (
    <LoaderContext.Provider value={{ show, setShow, toggleShow }}>
      {props.children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
