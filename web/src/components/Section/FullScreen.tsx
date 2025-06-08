import { ReactNode, useContext } from "react";
import { GlobalContext } from "../../App";
import { BgKey } from "../../interfaces";

type Props = {
  bg: BgKey;
  children: ReactNode;
};

export default function SectionFullScreen({ bg, children }: Props) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);

  return (
    <div className="fixed flex min-h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 dark:text-white">
      {children}
    </div>
  );
}
