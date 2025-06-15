import { ReactNode } from "react";

type Props = {
  path: string;
  w?: string;
  h?: string;
  size?: string | number | null;
  className?: string;
  children?: ReactNode;
};

export default function Icon({ path, w = "w-6", h = "h-6", size = 18, className = "", children }: Props) {
  return (
    <span className={`inline-flex items-center justify-center ${w} ${h} ${className}`}>
      <svg viewBox="0 0 24 24" width={size} height={size} className="inline-block">
        <path fill="currentColor" d={path} />
      </svg>
      {children}
    </span>
  );
}
