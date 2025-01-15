import { Field, Form, Formik } from "formik";
import Head from "next/head";
import type { ReactElement } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/Authenticated";

const UserPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("Customer")}</title>
      </Head>
      <SectionMain>
        <CardBox>
          <Formik
            initialValues={{
              username: "John Doe",
              language: "Administrator",
            }}
            onSubmit={values => alert(JSON.stringify(values, null, 2))}
          >
            <Form>
              <FormField label="Username" help="Required">
                <Field name="username" placeholder="username" id="username" />
              </FormField>

              <FormField label="Role" labelFor="role">
                <Field name="role" id="role" component="select">
                  <option value="administrator">Administrator</option>
                  <option value="user">User</option>
                </Field>
              </FormField>

              <Divider />

              <Buttons>
                <Button type="submit" color="info" label="Submit" />
              </Buttons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

UserPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default UserPage;
