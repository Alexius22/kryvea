import { mdiAccount, mdiLogout, mdiThemeLightDark } from "@mdi/js";
import { ReactNode, useContext } from "react";
import { GlobalContext } from "../App";
import Icon from "./Icon/Icon";

type Props = {
  children?: ReactNode;
};

export default function NavBar({ children }: Props) {
  const {
    useDarkTheme: [darkMode, setDarkMode],
  } = useContext(GlobalContext);

  return (
    <nav className="navbar">
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-x-4 p-4">
        <a href="/profile" className="flex items-center gap-x-2">
          <Icon path={mdiAccount} />
          Profile
        </a>

        <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-x-2 !bg-transparent">
          <Icon path={mdiThemeLightDark} />
        </button>

        <a href="/login" className="flex items-center gap-x-2">
          <Icon path={mdiLogout} />
          Logout
        </a>
      </div>
    </nav>
  );
}
