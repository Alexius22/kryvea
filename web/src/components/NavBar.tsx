import {
  mdiAccount,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiLogout,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from "@mdi/js";
import { ReactNode, useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import { getData, postData } from "../api/api";
import { GlobalContext } from "../App";
import { User } from "../types/common.types";
import Button from "./Form/Button";
import Buttons from "./Form/Buttons";
import Icon from "./Icon";

type Props = {
  children?: ReactNode;
};

export default function NavBar({ children }: Props) {
  const {
    useUsername: [username, setUsername],
    useDarkTheme: [darkTheme, setDarkTheme],
    useFullscreen: [fullscreen, setFullScreen],
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  useEffect(() => {
    getData<User>("/api/users/me", user => setUsername(user.username));
  }, []);

  const handleLogout = () => {
    postData("/api/logout", undefined, () => {
      navigate("/login", { replace: false, state: { from: window.location.pathname } });
    });
  };

  return (
    <nav className="navbar">
      {children}
      <Buttons className="sticky right-0" noWrap>
        <Button
          onClick={() => navigate("/profile")}
          icon={mdiAccount}
          text={username}
          className="gap-2 bg-transparent text-[color:--link]"
        />

        <div
          className={`relative h-4 w-4 text-[color:--link]`}
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
          className="gap-2 bg-transparent p-0 text-[color:--link]"
        />
      </Buttons>
    </nav>
  );
}
