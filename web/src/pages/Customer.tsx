import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

const Customer = () => {
  useEffect(() => {
    document.title = getPageTitle("Customer");
  }, []);

  return (
    <>
      <SectionMain>
        <CardBox>
          <Formik
            initialValues={{
              companyName: "Test",
              language: "italian",
            }}
            onSubmit={values => alert(JSON.stringify(values, null, 2))}
          >
            <Form>
              <FormField label="Company Name" help="Required">
                <Field name="companyName" placeholder="CompanyName" id="companyName" />
              </FormField>

              <FormField label="Language" labelFor="language">
                <Field name="language" id="language" component="select">
                  <option value="italian">Italian</option>
                  <option value="english">English</option>
                </Field>
              </FormField>

              <FormField label="Default CVSS Version" labelFor="cvss">
                <Field name="cvss" id="cvss" component="select">
                  <option value="2">2</option>
                  <option value="3.1">3.1</option>
                  <option value="4">4</option>
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

export default Customer;
