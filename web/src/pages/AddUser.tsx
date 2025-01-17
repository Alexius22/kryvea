import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

const AddUser = () => {
  useEffect(() => {
    document.title = getPageTitle("User");
  }, []);

  return (
    <>
      <SectionMain>
        <CardBox>
          <Formik
            initialValues={{
              username: "John Doe",
              role: "Administrator",
            }}
            onSubmit={values => alert(JSON.stringify(values, null, 2))}
          >
            <Form>
              <FormField label="Username" help="Required">
                <Field name="username" id="username" placeholder="username" />
              </FormField>
              <FormField label="Email" help="Required">
                <Field name="email" id="email" placeholder="example@email.com" />
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
                <Button type="cancel" color="info" outline label="Cancel" />
              </Buttons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default AddUser;
