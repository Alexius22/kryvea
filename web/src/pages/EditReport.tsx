import { Form, Formik } from "formik";
import { useEffect } from "react";
import CardBox from "../components/CardBox/CardBox";
import Grid from "../components/Composition/Grid";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";

const EditReport = () => {
  useEffect(() => {
    document.title = getPageTitle("Edit Report");
  }, []);

  return (
    <CardBox>
      <Formik initialValues={{}} onSubmit={undefined}>
        <Form>
          <Grid className="grid-cols-2">
            <Input type="text" id="layout" multiline placeholder="Layout here" />
            <Input type="text" id="preview" multiline placeholder="Preview here" />
          </Grid>
        </Form>
      </Formik>
    </CardBox>
  );
};

export default EditReport;
