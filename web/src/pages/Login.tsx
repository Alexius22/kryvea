import { Field, Form, Formik } from "formik";
import { useEffect, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormCheckRadio from "../components/Form/CheckRadio";
import FormField from "../components/Form/Field";
import SectionFullScreen from "../components/Section/FullScreen";
import { getPageTitle } from "../config";
import LayoutGuest from "../layouts/Guest";

type LoginForm = {
  login: string;
  password: string;
  remember: boolean;
};

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = formValues => {
    navigate("/dashboard");
  };

  const initialValues: LoginForm = {
    login: "john.doe",
    password: "bG1sL9eQ1uD2sK3b",
    remember: true,
  };

  useEffect(() => {
    document.title = getPageTitle("Login");
  }, []);

  return (
    <>
      <SectionFullScreen bg="pinkRed">
        <CardBox className="w-11/12 shadow-2xl md:w-7/12 lg:w-6/12 xl:w-4/12">
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            <Form>
              <FormField label="Login" help="Please enter your login">
                <Field name="login" />
              </FormField>

              <FormField label="Password" help="Please enter your password">
                <Field name="password" type="password" />
              </FormField>

              <FormCheckRadio type="checkbox" label="Remember">
                <Field type="checkbox" name="remember" />
              </FormCheckRadio>

              <Divider />

              <Buttons>
                <Button type="submit" label="Login" color="info" />
              </Buttons>
            </Form>
          </Formik>
        </CardBox>
      </SectionFullScreen>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return <LayoutGuest>{page}</LayoutGuest>;
};

export default Login;
