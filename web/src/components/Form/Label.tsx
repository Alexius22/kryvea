export default function Label({ disabled = undefined, className = "", text, htmlFor = undefined }) {
  return htmlFor ? (
    <label data-disabled={disabled} className={`font-bold ${className}`} htmlFor={htmlFor}>
      {text}
    </label>
  ) : (
    <span data-disabled={disabled} className={`font-bold ${className}`}>
      {text}
    </span>
  );
}
