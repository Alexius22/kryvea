import { mdiAccount, mdiAsterisk, mdiFormTextboxPassword, mdiMail } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import Head from "next/head";
import { useContext, type ReactElement } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxComponentBody from "../components/CardBox/Component/Body";
import CardBoxComponentFooter from "../components/CardBox/Component/Footer";
import CardBoxUser from "../components/CardBox/User";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import { getPageTitle } from "../config";
import type { UserForm } from "../interfaces";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated";
import { GlobalContext } from "./_app";

const ProfilePage = () => {
  const {
    useUsername: [username],
    useUserEmail: [userEmail],
  } = useContext(GlobalContext);

  const userForm: UserForm = {
    name: username,
    email: userEmail,
  };

  return (
    <>
      <Head>
        <title>{getPageTitle("Profile")}</title>
      </Head>

      <SectionMain>
        <SectionTitleLineWithButton icon={mdiAccount} title="Profile" main></SectionTitleLineWithButton>

        <CardBoxUser className="mb-6" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col">
            <CardBox className="flex-1" hasComponentLayout>
              <Formik initialValues={userForm} onSubmit={(values: UserForm) => alert(JSON.stringify(values, null, 2))}>
                <Form className="flex flex-1 flex-col">
                  <CardBoxComponentBody>
                    <FormField label="Name" help="Required" labelFor="name" icons={[mdiAccount]}>
                      <Field name="name" id="name" placeholder="Name" />
                    </FormField>
                    <FormField label="E-mail" help="Required" labelFor="email" icons={[mdiMail]}>
                      <Field name="email" id="email" placeholder="E-mail" />
                    </FormField>
                  </CardBoxComponentBody>
                  <CardBoxComponentFooter>
                    <Buttons>
                      <Button color="info" type="submit" label="Submit" />
                    </Buttons>
                  </CardBoxComponentFooter>
                </Form>
              </Formik>
            </CardBox>
          </div>

          <CardBox hasComponentLayout>
            <Formik
              initialValues={{
                currentPassword: "",
                newPassword: "",
                newPasswordConfirmation: "",
              }}
              onSubmit={values => alert(JSON.stringify(values, null, 2))}
            >
              <Form className="flex flex-1 flex-col">
                <CardBoxComponentBody>
                  <FormField label="Current password" help="Required" labelFor="currentPassword" icons={[mdiAsterisk]}>
                    <Field
                      name="currentPassword"
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                    />
                  </FormField>

                  <Divider />

                  <FormField
                    label="New password"
                    help="Required"
                    labelFor="newPassword"
                    icons={[mdiFormTextboxPassword]}
                  >
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
                </CardBoxComponentBody>

                <CardBoxComponentFooter>
                  <Buttons>
                    <Button color="info" type="submit" label="Submit" />
                  </Buttons>
                </CardBoxComponentFooter>
              </Form>
            </Formik>
          </CardBox>
        </div>
      </SectionMain>
    </>
  );
};

ProfilePage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default ProfilePage;
