import axios from "axios";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import CardBox from "../components/CardBox/CardBox";
import Grid from "../components/Composition/Grid";
import Input from "../components/Form/Input";
import SectionFullScreen from "../components/Section/FullScreen";
import { getPageTitle } from "../config";

type LoginForm = {
  login: string;
  password: string;
  remember: boolean;
};

const Login = () => {
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
    <SectionFullScreen>
      <CardBox className="w-[500px]">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form>
            <Grid>
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
                onChange={e => setUsername(e.target.value)}
                value={username}
              />
              <div className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 cursor-pointer"
                  id="override_categories"
                  onChange={e => setRemember}
                />
                <label className="ml-2 cursor-pointer text-sm" htmlFor="override_categories">
                  Remember me
                </label>
              </div>
              <Button type="submit" label="Login" onClick={() => {}} />
            </Grid>
          </Form>
        </Formik>
      </CardBox>
    </SectionFullScreen>
  );
};

export default Login;
