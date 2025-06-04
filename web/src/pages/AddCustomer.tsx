import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import { getPageTitle } from "../config";
import SelectWrapper from "../components/Form/SelectWrapper";

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

            <FormField label="Language" labelFor="language" singleChild>
              <SelectWrapper
                id="language-selection"
                options={[
                  { value: "italian", label: "Italian" },
                  { value: "english", label: "English" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected language:", option.value)}
              />
            </FormField>

            <FormField label="Default CVSS Version" labelFor="cvss" singleChild>
              <SelectWrapper
                id="cvss-selection"
                options={[
                  { value: "4", label: "4" },
                  { value: "3.1", label: "3.1" },
                  { value: "2", label: "2" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected CVSS version:", option.value)}
              />
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

export default AddCustomer;
