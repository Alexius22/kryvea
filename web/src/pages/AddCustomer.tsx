import { Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
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
            <Grid className="gap-4">
              <Input
                type="text"
                label="Company Name"
                helperSubtitle="Required"
                placeholder="CompanyName"
                id="companyName"
              />

              <SelectWrapper
                label="Language"
                id="language"
                options={[
                  { value: "italian", label: "Italian" },
                  { value: "english", label: "English" },
                  { value: "spanish", label: "Spanish" },
                  { value: "french", label: "French" },
                  { value: "german", label: "German" },
                ]}
                onChange={option => console.log("Selected language:", option.value)}
              />

              <SelectWrapper
                label="Default CVSS Version"
                id="cvss"
                options={[
                  { value: "4", label: "4" },
                  { value: "3.1", label: "3.1" },
                  { value: "2", label: "2" },
                ]}
                onChange={option => console.log("Selected CVSS version:", option.value)}
              />

              <Divider />

              <Buttons>
                <Button type="submit" label="Submit" />
                <Button type="reset" outline label="Cancel" />
              </Buttons>
            </Grid>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default AddCustomer;
