import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import CardBox from "../components/CardBox";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";

const EditReport = () => {
  useEffect(() => {
    document.title = getPageTitle("Edit Report");
  }, []);

  return (
    <>
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

export default EditReport;
