import { Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Input from "../components/Form/Input";
import { getPageTitle } from "../config";

const AddHost = () => {
  useEffect(() => {
    document.title = getPageTitle("Customer");
  }, []);

  return (
    <div>
      <CardBox>
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <Grid>
              <Input type="text" id="ipv4" label="IPv4" placeholder="IPv4 address" />
              <Input type="text" id="ipv6" label="IPv6" placeholder="IPv6 address" />
              <Input type="text" id="fqdn" label="FQDN" placeholder="Fully Qualified Domain Name" />
              <Input type="text" id="host_id" label="Host name ID" placeholder="Sample name" />
            </Grid>
            <Divider />
            <Buttons>
              <Button type="submit" label="Submit" />
              <Button type="reset" outline label="Cancel" />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default AddHost;
