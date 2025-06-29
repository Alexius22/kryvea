export default function Subtitle({ className = "", text }) {
  return <span className={`text-xs font-light ${className}`}>{text === "" ? <>&nbsp;</> : text}</span>;
}
