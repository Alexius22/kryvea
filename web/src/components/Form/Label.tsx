export default function Label({ className = "", text, htmlFor = undefined }) {
  return htmlFor ? (
    <label className={`font-bold ${className}`} htmlFor={htmlFor}>
      {text}
    </label>
  ) : (
    <span className={`font-bold ${className}`}>{text}</span>
  );
}
