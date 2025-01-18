import { ReactNode, useContext } from "react";
import { GlobalContext } from "../../../App";
import { gradientBgDark, gradientBgPinkRed, gradientBgPurplePink } from "../../colors";
import { BgKey } from "../../interfaces";

type Props = {
  bg: BgKey;
  children: ReactNode;
};

export default function SectionFullScreen({ bg, children }: Props) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);

  let componentClass = "flex min-h-screen items-center justify-center absolute h-[104vh] -top-10 w-screen left-0 z-50 ";

  if (darkTheme) {
    componentClass += gradientBgDark;
  } else if (bg === "purplePink") {
    componentClass += gradientBgPurplePink;
  } else if (bg === "pinkRed") {
    componentClass += gradientBgPinkRed;
  }

  return <div className={componentClass}>{children}</div>;
}
