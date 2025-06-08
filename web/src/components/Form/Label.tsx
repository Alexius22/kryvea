export default function Label({ className = "", text, htmlFor = "" }) {
  return (
    <label className={`font-bold ${className}`} htmlFor={htmlFor}>
      {text}
    </label>
  );
}
