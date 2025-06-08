import { mdiAccount } from "@mdi/js";
import { Form, Formik } from "formik";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../App";
import Button from "../components/Button";
import CardBox from "../components/CardBox/CardBox";
import Grid from "../components/Composition/Grid";
import Input from "../components/Form/Input";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import { getPageTitle } from "../config";

const Profile = () => {
  const {
    useUsername: [username],
  } = useContext(GlobalContext);

  useEffect(() => {
    document.title = getPageTitle("Profile");
  }, []);

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiAccount} title="Profile" main></SectionTitleLineWithButton>
      <CardBox className="w-[530px] max-w-full">
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
              <Button type="submit" label="Submit" />
            </Grid>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default Profile;
