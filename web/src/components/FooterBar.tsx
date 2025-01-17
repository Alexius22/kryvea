import React, { ReactNode } from "react";
import { containerMaxW } from "../config";
import { Link } from "react-router";

type Props = {
  children: ReactNode;
};

export default function FooterBar({ children }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className={`px-6 py-2 ${containerMaxW}`}>
      <div className="block items-center justify-between md:flex">
        <div className="mb-6 text-center md:mb-0 md:text-left">
          <b>
            &copy;{year},{` `}
            <Link to="https://github.com/Alexius22/kryvea" rel="noreferrer" target="_blank">
              Kryvea
            </Link>
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
