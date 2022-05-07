import SimpleLoader from "./SimpleLoader";

export default function SaleProgressBar({ sold, total, load }) {
  const progress = (sold / total) * 100;
  return (
    <div className="">
      {load || (
        <div>
          <p className="text-gray-500 text-base font-semibold mb-1">
            {sold} of {total} NFTs are minted.
          </p>
        </div>
      )}
      <div className="relative h-8 bg-gray-200 rounded-md overflow-hidden ring-4 ring-red-500 ring-opacity-30">
        {load ? (
          <div className="absolute inset-0 flex items-center justify-center ">
            <SimpleLoader />
          </div>
        ) : (
          <div
            className="absolute left-0 top-0 bottom-0 bg-red-500 bg-opacity-90"
            style={{ width: `${progress}%` }}
          ></div>
        )}
      </div>
    </div>
  );
}
