import { ReactNode } from "react";
import { Link } from "react-router";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function FooterBar({ className, children }: Props) {
  const year = new Date().getFullYear();

  return (
    <footer className={className}>
      <div className="flex justify-between">
        <div>
          <b>
            &copy;{year},&nbsp;
            <Link to="https://github.com/Alexius22/kryvea" rel="noreferrer" target="_blank">
              Kryvea.
            </Link>
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
