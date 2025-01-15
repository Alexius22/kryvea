import React, { ReactNode, useContext } from "react";
import { BgKey } from "../../interfaces";
import { gradientBgPurplePink, gradientBgDark, gradientBgPinkRed } from "../../colors";
import { GlobalContext } from "../../pages/_app";

type Props = {
  bg: BgKey;
  children: ReactNode;
};

export default function SectionFullScreen({ bg, children }: Props) {
  const {
    useDarkTheme: [darkTheme],
  } = useContext(GlobalContext);

  let componentClass = "flex min-h-screen items-center justify-center ";

  if (darkTheme) {
    componentClass += gradientBgDark;
  } else if (bg === "purplePink") {
    componentClass += gradientBgPurplePink;
  } else if (bg === "pinkRed") {
    componentClass += gradientBgPinkRed;
  }

  return <div className={componentClass}>{children}</div>;
}
