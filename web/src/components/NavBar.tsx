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
      <Buttons noWrap>
        <Button
          onClick={() => navigate("/profile")}
          icon={mdiAccount}
          text={username}
          className="gap-1 bg-transparent p-2 text-[color:--link]"
        />
        <Button
          onClick={() => setDarkTheme(prev => !prev)}
          className="relative bg-transparent text-[color:--link]"
          title={"Switch theme"}
        >
          <Icon
            path={mdiWhiteBalanceSunny}
            className={`absolute left-0 top-0 opacity-0 ${darkTheme ? "" : "rotateFadeIn"}`}
          />
          <Icon
            path={mdiWeatherNight}
            className={`absolute left-0 top-0 opacity-0 ${darkTheme ? "rotateFadeIn" : ""}`}
          />
        </Button>
        <Button
          onClick={() => setFullScreen(prev => !prev)}
          icon={fullscreen ? mdiFullscreenExit : mdiFullscreen}
          className="bg-transparent !pl-3 !pr-0 text-[color:--link]"
          title={`${fullscreen ? "Exit fullscreen" : "Fullscreen"}`}
        />
        <Button
          onClick={handleLogout}
          icon={mdiLogout}
          text="Logout"
          className="gap-1 bg-transparent p-2 text-[color:--link]"
        />
      </Buttons>
    </nav>
  );
}
