import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormCheckRadio from "../components/Form/CheckRadio";
import FormField from "../components/Form/Field";
import SectionFullScreen from "../components/Section/FullScreen";
import { getPageTitle } from "../config";
import axios from "axios";

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

  // kryvea:kryveapassword
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
    <SectionFullScreen bg="purplePink">
      <CardBox className="w-[500px]">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <Form className="flex flex-col gap-2">
            <div className="grid">
              <label htmlFor="username">Username</label>
              <Field
                className="no-spinner w-full max-w-full rounded px-3 py-2 dark:placeholder-gray-400"
                name="login"
                id="username"
                onChange={e => setUsername(e.target.value)}
                value={username}
              />
            </div>

            <div className="grid">
              <label htmlFor="password">Password</label>
              <Field name="password" type="password" onChange={e => setPassword(e.target.value)} value={password} />
            </div>

            <FormCheckRadio type="checkbox" label="Remember">
              <Field type="checkbox" name="remember" value={error} onChange={e => setError(e.target.checkbox)} />
            </FormCheckRadio>

            <Divider />

            <Buttons>
              <Button type="submit" label="Login" color="info" onClick={() => {}} />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </SectionFullScreen>
  );
};

export default Login;
