import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Subtitle from "../components/Composition/Subtitle";
import Button from "../components/Form/Button";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
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
    if (document.cookie.includes("kryvea_shadow=ok")) {
      navigate(from, { replace: true });
      return;
    }

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
            <Input
              type="password"
              id="password"
              label="Password"
              onChange={e => setPassword(e.target.value)}
              value={password}
            />
            <Checkbox
              id={"remember_me"}
              onChange={e => setRemember(e.target.checked)}
              htmlFor={"remember_me"}
              label={"Remember me"}
            />
            <Subtitle className="text-[color:--error]" text={error} />
            <Button text="Login" className="justify-center" formSubmit />
          </Grid>
        </form>
      </Card>
    </div>
  );
}
