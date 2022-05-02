export default function Input({
  type,
  name,
  placeholder,
  value,
  onChange,
  autoComplete,
}) {
  return (
    <input
      type={type}
      className="cursor-cell rounded-2xl px-6 py-2 font-semibold ring-4 ring-gray-800 ring-opacity-10 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-50 w-full border-none placeholder-gray-500"
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete ? "on" : "off"}
    />
  );
}
