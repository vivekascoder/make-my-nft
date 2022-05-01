import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Button({ onClick, faIcon, text }) {
  return (
    <button
      onClick={onClick}
      className=" rounded-2xl border-2 border-red-500 bg-red-500 px-6 py-2 font-semibold text-white hover:bg-white hover:text-red-500"
      style={{ cursor: "cell" }}
    >
      {faIcon && (
        <FontAwesomeIcon icon={faIcon} className={`${text && "mr-2"}`} />
      )}
      {text && <span>{text}</span>}
    </button>
  );
}

export function ButtonLink({ href, faIcon, text }) {
  return (
    <a
      href={href}
      className="cursor-cell rounded-2xl border-2 border-red-500 bg-red-500 px-4 py-2 font-semibold text-white hover:bg-white hover:text-red-500"
      style={{ cursor: "cell" }}
    >
      {faIcon && (
        <FontAwesomeIcon icon={faIcon} className={`${text && "mr-2"}`} />
      )}
      {text && <span>{text}</span>}
    </a>
  );
}
