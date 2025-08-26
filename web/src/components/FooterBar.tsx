import { useRef, useState } from "react";
import { Link } from "react-router";

type Props = {
  className?: string;
};

export default function FooterBar({ className }: Props) {
  const heartRef = useRef<HTMLSpanElement>(null);
  const [clickCount, setClickCount] = useState(0);
  const [exploded, setExploded] = useState(false);

  const handleMouseOver = () => {
    if (heartRef.current) heartRef.current.classList.add("heart-up");
  };

  const handleMouseOut = () => {
    if (heartRef.current) heartRef.current.classList.remove("heart-up");
  };

  const handleClick = () => {
    if (!exploded) {
      const counter = clickCount + 1;
      setClickCount(counter);

      // Add heartbeat class to trigger animation
      if (heartRef.current) {
        heartRef.current.classList.add("beating");

        // Remove the class after the animation ends so it can retrigger
        heartRef.current.addEventListener(
          "animationend",
          () => {
            if (heartRef.current) {
              heartRef.current.classList.remove("beating");
            }
          },
          { once: true }
        );
      }

      if (counter === 5) {
        setExploded(true);
        if (heartRef.current) {
          heartRef.current.classList.add("explode");
        }
      }
    }
  };

  return (
    <footer className={`${className} select-none font-light italic`}>
      <div className="flex justify-between">
        <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
          <b>
            <Link to="https://github.com/Alexius22/kryvea" rel="noreferrer" target="_blank">
              Kryvea
            </Link>
            &nbsp;made with&nbsp;
            <span ref={heartRef} className="heart text-red-500 transition-all dark:text-red-500" onClick={handleClick}>
              ♥
            </span>
            &nbsp;by&nbsp;
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
            </Link>
            &nbsp;
          </b>
        </div>
        <div>
          <b>Version</b>: development
        </div>
      </div>
    </footer>
  );
}
