import { Form, Formik } from "formik";
import { useEffect } from "react";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { getPageTitle } from "../config";

export default function AddCustomer() {
  useEffect(() => {
    document.title = getPageTitle("Add Customer");
  }, []);

  return (
    <div>
      <Card>
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
                <Button text="Submit" onClick={() => {}} />
                <Button type="secondary" text="Cancel" onClick={() => {}} />
              </Buttons>
            </Grid>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
