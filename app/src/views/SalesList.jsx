import { faLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllCrowdsale } from "../utils/tzkt";

export default function SalesList() {
  const [sales, setSales] = useState([]);
  useEffect(() => {
    async function doSomething() {
      const s = [];
      const data = await fetchAllCrowdsale();
      Object.keys(data).map((sale) => {
        s.push({ name: data[sale], address: sale });
      });
      setSales(s);
    }
    doSomething();
  });
  return (
    <div className="max-w-2xl mx-auto pt-40 space-y-8">
      {sales.map((sale, index) => (
        <Link
          to={`/crowdsales/${sale.address}`}
          key={index}
          className="p-6 bg-red-500 rounded-md flex justify-between items-center transform transition-all hover:-translate-y-2"
        >
          <h1 className="text-2xl font-extrabold text-white">{sale.name}</h1>
          <FontAwesomeIcon icon={faLink} className="w-5 h-5 text-white" />
        </Link>
      ))}
    </div>
  );
}
