import { mdiAccount, mdiAsterisk, mdiFormTextboxPassword } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../App";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import FormField from "../components/Form/Field";
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
          <Form className="flex flex-1 flex-col gap-6">
            <div>
              <FormField label="Current password" help="Required" labelFor="currentPassword" icons={[mdiAsterisk]}>
                <Field name="currentPassword" id="currentPassword" type="password" autoComplete="current-password" />
              </FormField>
              <FormField label="New password" help="Required" labelFor="newPassword" icons={[mdiFormTextboxPassword]}>
                <Field name="newPassword" id="newPassword" type="password" autoComplete="new-password" />
              </FormField>

              <FormField
                label="Confirm password"
                help="Required"
                labelFor="newPasswordConfirmation"
                icons={[mdiFormTextboxPassword]}
              >
                <Field
                  name="newPasswordConfirmation"
                  id="newPasswordConfirmation"
                  type="password"
                  autoComplete="new-password"
                />
              </FormField>
            </div>
            <Buttons>
              <Button color="info" type="submit" label="Submit" />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default Profile;
