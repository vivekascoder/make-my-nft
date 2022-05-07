export default function Slider({
  min,
  max,
  value,
  onChange,
  className,
  ...extra
}) {
  return (
    <input
      type="range"
      className={`slider w-full ${className}`}
      name="slider"
      id="#slider"
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      {...extra}
    />
  );
}
