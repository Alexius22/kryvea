import { useEffect } from "react";
import Card from "../components/Composition/Card";
import Grid from "../components/Composition/Grid";
import PageHeader from "../components/Composition/PageHeader";
import Textarea from "../components/Form/Textarea";
import { getPageTitle } from "../utils/helpers";

export default function EditReport() {
  useEffect(() => {
    document.title = getPageTitle("Edit Report");
  }, []);

  return (
    <div>
      <PageHeader title="Edit Report" />
      <Card>
        <Grid className="grid-cols-2">
          <Textarea id="layout" placeholder="Layout here" />
          <Textarea id="preview" placeholder="Preview here" />
        </Grid>
      </Card>
    </div>
  );
}
