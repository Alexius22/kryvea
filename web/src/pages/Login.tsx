import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Subtitle from "../components/Composition/Subtitle";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.title = getPageTitle("Login");
  }, []);

  const handleSubmit = () => {
    postData(
      "/api/login",
      { username, password, remember },
      () => navigate("/dashboard"),
      err => {
        const errorMessage = err.response.data.error;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    );
  };

  return (
    <div className="card-modal fixed flex min-h-screen w-screen items-center justify-center">
      <Card className="glasscard">
        <Grid className="gap-4 p-1">
          <Input
            type="text"
            id="username"
            label="Username"
            onChange={e => setUsername(e.target.value)}
            value={username}
          />
          <Input
            type="password"
            id="password"
            label="Password"
            onChange={e => setPassword(e.target.value)}
            value={password}
          />
          <Grid className="gap-2">
            <Checkbox id={"remember_me"} onChange={e => setRemember} htmlFor={"remember_me"} label={"Remember me"} />
            <Subtitle className="text-[color:--error]" text={error} />
            <Divider />
            <Button text="Login" className="justify-center" onClick={handleSubmit} />
          </Grid>
        </Grid>
      </Card>
    </div>
  );
}
