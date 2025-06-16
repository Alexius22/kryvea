export default function Label({ className = "", text, htmlFor = undefined }) {
  return (
    <label className={`font-bold ${className}`} htmlFor={htmlFor}>
      {text}
    </label>
  );
}
