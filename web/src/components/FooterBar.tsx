import { useRef } from "react";
import { Link } from "react-router";

type Props = {
  className?: string;
};

export default function FooterBar({ className }: Props) {
  const heartRef = useRef(null);

  return (
    <footer className={`${className} select-none font-light italic`}>
      <div className="flex justify-between">
        <div
          onMouseOver={() => {
            if (heartRef.current) {
              heartRef.current.classList.add("heart-up");
            }
          }}
          onMouseOut={() => {
            if (heartRef.current) {
              heartRef.current.classList.remove("heart-up");
            }
          }}
        >
          <b>
            <Link to="https://github.com/Alexius22/kryvea" rel="noreferrer" target="_blank">
              Kryvea
            </Link>{" "}
            made with{" "}
            <span ref={heartRef} className="heart text-red-500 transition-all dark:text-red-500">
              ♥
            </span>{" "}
            by{" "}
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
        </div>
        <div>
          <b>Version</b>: development
        </div>
      </div>
    </footer>
  );
}
