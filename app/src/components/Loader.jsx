import { useLoader } from "../hooks/useLoader";

export default function Loader() {
  const { show } = useLoader();
  console.log(show);
  return (
    show && (
      <div className="flex items-center justify-center fixed inset-0 bg-black bg-opacity-80 z-50">
        <div className={`lds-grid`}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  );
}
