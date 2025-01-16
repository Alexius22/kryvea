import { Field, Form, Formik } from "formik";
import Head from "next/head";
import type { ReactElement } from "react";
import CardBox from "../components/CardBox";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/Authenticated";

const AddAssessmentPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("New Assessment")}</title>
      </Head>
      <SectionMain>
        <CardBox>
          <Formik initialValues={{}} onSubmit={undefined}>
            <Form>
              <FormField hasTextareaHeight>
                <Field name="textarea" as="textarea" placeholder="Layout here" />
                <Field name="textarea" as="textarea" placeholder="Preview here" />
              </FormField>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

AddAssessmentPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default AddAssessmentPage;
