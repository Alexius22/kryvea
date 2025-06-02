import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import { getPageTitle } from "../config";

const AddHost = () => {
  useEffect(() => {
    document.title = getPageTitle("Customer");
  }, []);

  return (
    <div>
      <CardBox>
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <FormField label="IPv4">
              <Field name="ip" id="ip" placeholder="IPv4 address"></Field>
            </FormField>

            <FormField label="IPv6">
              <Field name="ipv6" id="ipv6" placeholder="IPv6 address"></Field>
            </FormField>

            <FormField label="FQDN">
              <Field name="fqdn" id="fdqn" placeholder="Fully Qualified Domain Name"></Field>
            </FormField>

            <FormField label="Name" help="Specify a name to distinguish hosts with the same IP and FQDN">
              <Field name="name" id="name" placeholder="Sample name"></Field>
            </FormField>

            <Divider />

            <Buttons>
              <Button type="submit" label="Submit" />
              <Button type="reset" outline label="Cancel" />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default AddHost;
