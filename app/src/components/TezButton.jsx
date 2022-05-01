import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TezButton = ({ onClick, faIcon, href, text, children, ...extra }) => {
  return (
    <div className="relative group inline-block ml-4 text-white">
      <div
        className={`bg-${extra?.color}-300 transform w-full h-full top-2 -left-2 absolute transition-all`}
      ></div>
      <button
        onClick={onClick}
        href={href}
        className={`bg-${extra?.color}-500 flex items-center justify-center ${extra?.padding} ${extra?.textSize} rounded-sm relative group-active:-left-2 group-active:top-2 transition-all hover:bg-${extra?.color}-600 `}
        disabled={extra?.disabled}
      >
        {faIcon && (
          <FontAwesomeIcon icon={faIcon} className={`${text && "mr-2"}`} />
        )}
        {text && <span>{text}</span>}
      </button>
    </div>
  );
};

const TezLink = ({ faIcon, href, text, children, ...extra }) => {
  return (
    <div className="relative group inline-block  text-white">
      <div
        className={`bg-${extra?.color}-300 transform w-full h-full top-2 -left-2 absolute transition-all`}
      ></div>
      <a
        href={href}
        className={`bg-${extra?.color}-500 inline-block ${extra?.padding} ${extra?.textSize} rounded-sm relative group-active:-left-2 group-active:top-2 transition-all hover:bg-${extra?.color}-600`}
        target={extra?.target}
        rel={extra?.rel}
      >
        {faIcon && (
          <FontAwesomeIcon icon={faIcon} className={`${text && "mr-2"}`} />
        )}
        {text && <span>{text}</span>}
      </a>
    </div>
  );
};

export { TezButton, TezLink };

export default TezButton;
