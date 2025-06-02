import { ReactNode, useContext } from "react";
import { GlobalContext } from "../../App";

type Props = {
  children: ReactNode;
};

export default function SectionFullScreen({ children }: Props) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);

  return (
    <div className="fixed flex min-h-screen w-screen items-center justify-center bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-800 dark:to-slate-700 dark:text-white">
      {children}
    </div>
  );
}
