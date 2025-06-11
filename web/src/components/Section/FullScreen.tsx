import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function SectionFullScreen({ children }: Props) {
  return (
    <div className="fixed flex min-h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700">
      {children}
    </div>
  );
}
