import React, { ReactNode } from "react";
import { containerMaxW } from "../config";

type Props = {
  children: ReactNode;
};

export default function FooterBar({ children }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className={`py-2 px-6 ${containerMaxW}`}>
      <div className="block md:flex items-center justify-between">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <b>
            &copy;{year},{` `}
            <a href="https://github.com/Alexius22/kryvea" rel="noreferrer" target="_blank">
              Kryvea
            </a>
            .
          </b>
          {` `}
          {children}
        </div>
        <div className="md:py-2">
          <b>Version</b>: development
        </div>
      </div>
    </footer>
  );
}
