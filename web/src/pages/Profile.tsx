import { mdiAccount } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Button from "../components/Form/Button";
import Input from "../components/Form/Input";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";

export default function Profile() {
  useEffect(() => {
    document.title = getPageTitle("Profile");
  }, []);

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiAccount} title="Profile" main></SectionTitleLineWithButton>
      <Card className="w-1/3 max-w-full">
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            newPasswordConfirmation: "",
          }}
          onSubmit={values => alert(JSON.stringify(values, null, 2))}
        >
          <Form>
            <Grid className="gap-4">
              <Input type="password" id="current_password" label="Current password" helperSubtitle="Required" />
              <Input type="password" id="new_password" label="New password" helperSubtitle="Required" />
              <Input type="password" id="confirm_password" label="Confirm password" helperSubtitle="Required" />
            </Grid>
            <div className="pt-4">
              <Button text="Submit" onClick={() => {}} />
            </div>
          </Form>
        </Formik>
      </Card>
    </div>
  );
}
