import { mdiEye, mdiEyeOff } from "@mdi/js";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Subtitle from "../components/Composition/Subtitle";
import Button from "../components/Form/Button";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import Icon from "../components/Icon";
import { getPageTitle } from "../config";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    document.title = getPageTitle("Login");
  }, []);

  const handleSubmit = () => {
    postData(
      "/api/login",
      { username, password, remember },
      () => {
        navigate(from, { replace: true });
      },
      err => {
        const errorMessage = err.response.data.error;
        setError(errorMessage);
      }
    );
  };

  return (
    <div className="card-modal fixed flex min-h-screen w-screen items-center justify-center">
      <Card className="glasscard">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Grid className="gap-4 p-1">
            <Input
              type="text"
              id="username"
              label="Username"
              onChange={e => setUsername(e.target.value)}
              value={username}
              autoFocus
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                label="Password"
                onChange={e => setPassword(e.target.value)}
                value={password}
                className="pr-10"
              />
              <span
                role="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[38px] cursor-pointer p-1"
              >
                <Icon path={showPassword ? mdiEye : mdiEyeOff} />
              </span>
            </div>
            <Checkbox
              id={"remember_me"}
              onChange={e => setRemember(e.target.checked)}
              htmlFor={"remember_me"}
              label={"Remember me"}
            />
            <Subtitle className="text-[color:--error]" text={error} />
            <Button text="Login" className="justify-center" onClick={() => {}} />
          </Grid>
        </form>
      </Card>
    </div>
  );
}
