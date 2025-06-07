import { mdiAccount, mdiAsterisk, mdiFormTextboxPassword } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../App";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import FormField from "../components/Form/Field";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import { getPageTitle } from "../config";
import Input from "../components/Form/Input";

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
          <Form className="flex flex-1 flex-col gap-4">
            <div className="grid gap-4">
              <Input type="password" id="current_password" label="Current password" helperSubtitle="Required" />
              <Input type="password" id="new_password" label="New password" helperSubtitle="Required" />
              <Input type="password" id="confirm_password" label="Confirm password" helperSubtitle="Required" />
            </div>
            <Buttons>
              <Button type="submit" label="Submit" />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default Profile;
