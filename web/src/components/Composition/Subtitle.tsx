export default function Subtitle({ className = "", text }) {
  return <span className={`place-self-start text-xs font-light ${className}`}>{text === "" ? <>&nbsp;</> : text}</span>;
}
