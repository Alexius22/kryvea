import { ReactNode } from "react";
import { Link } from "react-router";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function FooterBar({ className, children }: Props) {
  return (
    <footer className={`${className} font-light italic`}>
      <div className="flex justify-between">
        <div>
          <b>
            <Link to="https://github.com/Alexius22/kryvea" rel="noreferrer" target="_blank">
              Kryvea
            </Link>{" "}
            made with <span className="text-red-500 dark:text-red-500">♥</span> by{" "}
            <Link to="https://github.com/Alexius22" rel="noreferrer" target="_blank">
              Alexius
            </Link>
            {", "}
            <Link to="https://github.com/CharminDoge" rel="noreferrer" target="_blank">
              CharminDoge
            </Link>
            {" and "}
            <Link to="https://github.com/JJJJJJack" rel="noreferrer" target="_blank">
              Jack
            </Link>{" "}
          </b>
          {children}
        </div>
        <div>
          <b>Version</b>: development
        </div>
      </div>
    </footer>
  );
}
