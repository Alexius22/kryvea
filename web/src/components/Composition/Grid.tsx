export default function Grid({ className = "", children }) {
  return <div className={`grid gap-2 ${className}`}>{children}</div>;
}
