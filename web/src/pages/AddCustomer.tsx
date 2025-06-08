import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import { getPageTitle } from "../config";

const AddCustomer = () => {
  useEffect(() => {
    document.title = getPageTitle("Add Customer");
  }, []);

  return (
    <div>
      <CardBox>
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <FormField label="Company Name" help="Required">
              <Field name="companyName" placeholder="Company name" id="companyName" />
            </FormField>

            <FormField label="Language" labelFor="language">
              <Field name="language" id="language" component="select">
                <option value="italian">Italian</option>
                <option value="english">English</option>
              </Field>
            </FormField>

            <FormField label="Default CVSS Version" labelFor="cvss">
              <Field name="cvss" id="cvss" component="select">
                <option value="4">4</option>
                <option value="3.1">3.1</option>
                <option value="2">2</option>
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
    </div>
  );
};

export default AddCustomer;
