import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Button({ onClick, faIcon, text }) {
  return (
    <button
      onClick={onClick}
      className="text-sm rounded-2xl border-2 border-red-500 bg-red-500 px-6 py-2 font-semibold text-white hover:bg-white hover:text-red-500"
      style={{ cursor: "cell" }}
    >
      {faIcon && (
        <FontAwesomeIcon icon={faIcon} className={`${text && "mr-2"}`} />
      )}
      {text && <span>{text}</span>}
    </button>
  );
}
export function WhiteButton({ onClick, faIcon, text, size, disabled }) {
  const getClass = () => {
    if (size == "sm") {
      return `cursor-cell rounded-xl border-2 border-gray-200 ${disabled ? 'bg-gray-300' : 'bg-white'} px-4 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-100`;
    } else {
      return `cursor-cell rounded-2xl border-2 border-gray-200 ${disabled ? 'bg-gray-300' : 'bg-white'} px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100`;
    }
  };
  return (
    <button onClick={onClick} className={getClass()} style={{ cursor: `${disabled ? 'no-drop' : 'cell'}` }} disabled={disabled}>
      {faIcon && (
        <FontAwesomeIcon
          icon={faIcon}
          className={`${text && "mr-2"} ${
            size == "sm" ? "text-xs" : "text-sm"
          }`}
        />
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
        <FontAwesomeIcon icon={faIcon} className={`${text && "mr-2"} `} />
      )}
      {text && <span>{text}</span>}
    </a>
  );
}
