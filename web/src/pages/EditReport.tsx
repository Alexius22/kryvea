import { Form, Formik } from "formik";
import { useEffect } from "react";
import Card from "../components/Composition/Card";
import Grid from "../components/Composition/Grid";
import Textarea from "../components/Form/Textarea";
import { getPageTitle } from "../utils/helpers";

export default function EditReport() {
  useEffect(() => {
    document.title = getPageTitle("Edit Report");
  }, []);

  return (
    <Card>
      <Formik initialValues={{}} onSubmit={undefined}>
        <Form>
          <Grid className="grid-cols-2">
            <Textarea id="layout" placeholder="Layout here" />
            <Textarea id="preview" placeholder="Preview here" />
          </Grid>
        </Form>
      </Formik>
    </Card>
  );
}
