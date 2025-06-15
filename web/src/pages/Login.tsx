import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";

type LoginForm = {
  login: string;
  password: string;
  remember: boolean;
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = _ => {
    axios
      .post("/api/login", {
        username,
        password,
      })
      .then(r => {
        console.log(r);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const initialValues: LoginForm = {
    login: "TestUser",
    password: "secretpassword",
    remember: true,
  };

  useEffect(() => {
    document.title = getPageTitle("Login");
  }, []);

  return (
    <div className="card-modal fixed flex min-h-screen w-screen items-center justify-center">
      <Card className="glasscard">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form>
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
              <Checkbox id={"remember_me"} onChange={e => setRemember} htmlFor={"remember_me"} label={"Remember me"} />
              <Divider />
              <Button text="Login" className="justify-center" onClick={() => {}} />
            </Grid>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
