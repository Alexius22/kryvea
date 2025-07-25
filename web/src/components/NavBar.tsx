import {
  mdiAccount,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiLogout,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from "@mdi/js";
import { ReactNode, useContext } from "react";
import { useNavigate } from "react-router";
import { postData } from "../api/api";
import { GlobalContext } from "../App";
import Button from "./Form/Button";
import Buttons from "./Form/Buttons";
import Icon from "./Icon";

type Props = {
  children?: ReactNode;
};

export default function NavBar({ children }: Props) {
  const {
    useDarkTheme: [darkTheme, setDarkTheme],
    useFullscreen: [fullscreen, setFullScreen],
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    postData("/api/logout", undefined, () => {
      navigate("/login", { replace: false, state: { from: window.location.pathname } });
    });
  };

  return (
    <nav className="navbar">
      {children}
      <Buttons containerClassname="sticky right-0 !bg-[color:--bg-primary]" noWrap>
        <Button
          onClick={() => navigate("/profile")}
          icon={mdiAccount}
          text="Profile"
          className="gap-2 bg-transparent text-[color:--link]"
        />

        <div
          className={`relative h-4 w-4 ${darkTheme ? "text-amber-400" : "text-[color:--link]"}`}
          onClick={() => setDarkTheme(prev => !prev)}
          role="button"
          tabIndex={0}
        >
          <Icon path={mdiWhiteBalanceSunny} className={`absolute opacity-0 ${darkTheme ? "" : "rotateFadeIn"}`} />
          <Icon path={mdiWeatherNight} className={`absolute opacity-0 ${darkTheme ? "rotateFadeIn" : ""}`} />
        </div>

        <Button
          onClick={() => setFullScreen(prev => !prev)}
          icon={fullscreen ? mdiFullscreenExit : mdiFullscreen}
          className="bg-transparent text-[color:--link]"
        />

        <Button
          onClick={handleLogout}
          icon={mdiLogout}
          text="Logout"
          className="gap-2 bg-transparent text-[color:--link]"
        />
      </Buttons>
    </nav>
  );
}
