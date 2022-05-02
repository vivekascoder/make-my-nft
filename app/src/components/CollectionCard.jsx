export default function CollectionCard() {
  return (
    <div className="relative w-60 overflow-hidden rounded-lg shadow-md">
      <img
        src="https://nomadlist.com/assets/img/places/warsaw-poland.jpg"
        className="h-60 w-60 object-cover"
      />
      <div className="absolute top-0 left-0 right-0 p-2">
        <h1 className="font-semibold text-white text-center text-xl">
          The glorious pandaz
        </h1>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white">☀️ 345/500</span>
          <button className="cursor-cell rounded-2xl border-2 border-red-500 bg-red-500 px-4 py-1 text-xs font-semibold text-white hover:bg-white hover:text-red-500">
            Mint
          </button>
        </div>
      </div>
    </div>
  );
}
