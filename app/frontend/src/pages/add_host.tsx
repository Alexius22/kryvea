import { Field, Form, Formik } from "formik";
import Head from "next/head";
import type { ReactElement } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated";

const AddHostPage = () => {
  return (
    <>
      <Head>
        <title>{getPageTitle("Add host")}</title>
      </Head>
      <SectionMain>
        <CardBox>
          <Formik initialValues={{}} onSubmit={undefined}>
            <Form>
              <FormField label="IPv4">
                <Field name="ip" id="ip" placeholder="IPv4 address"></Field>
              </FormField>

              <FormField label="IPv6">
                <Field name="ipv6" id="ipv6" placeholder="IPv6 address"></Field>
              </FormField>

              <FormField label="FQDN">
                <Field name="fqdn" id="fdqn" placeholder="Fully Qualified Domain Name"></Field>
              </FormField>

              <Divider />

              <Buttons>
                <Button type="submit" color="info" label="Submit" />
                <Button type="cancel" color="info" outline label="Cancel" />
              </Buttons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

AddHostPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default AddHostPage;
