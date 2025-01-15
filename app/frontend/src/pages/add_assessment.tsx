import { mdiCalendar, mdiPlus } from "@mdi/js";
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
              <FormField label="Assessment Type">
                <Field name="assessment_type" id="assessment_type" component="select">
                  <option value="vapt">Vulnerability Assessment Penetration Test</option>
                  <option value="wapt">Web Application Penetration Test</option>
                  <option value="mapt">Mobile Application Penetration Test</option>
                  <option value="npt">Network Penetration Test</option>
                  <option value="rt">Red Team</option>
                </Field>
              </FormField>

              <FormField label="Name">
                <Field name="name" id="name" placeholder="Insert a name"></Field>
              </FormField>

              <FormField label="Activity period" icons={[mdiCalendar, mdiCalendar]}>
                <Field type="date" name="start" />
                <Field type="date" name="end" />
              </FormField>

              <div className="grid grid-cols-[1fr_auto] gap-4">
                <FormField label="Session targets">
                  <Field name="session_target" id="session_target" placeholder="Insert a target" />
                </FormField>
                <div className="mt-[2rem]">
                  <Button className="h-12" color="info" icon={mdiPlus} label="Add Host" href="/add_host" />
                </div>
              </div>

              <FormField label="CVSS Version">
                <Field name="cvss" id="cvss" component="select">
                  <option value="2">2</option>
                  <option value="3.1">3.1</option>
                  <option value="4">4</option>
                </Field>
              </FormField>

              <FormField label="Environment">
                <Field name="environment" id="environment" component="select">
                  <option value="pre">Pre-Production</option>
                  <option value="prod">Production</option>
                </Field>
              </FormField>

              <FormField label="Test type">
                <Field name="test_type" id="test_type" component="select">
                  <option value="white">White Box</option>
                  <option value="gray">Gray Box</option>
                  <option value="black">Black Box</option>
                </Field>
              </FormField>

              <FormField label="OSSTMM Vector">
                <Field name="osstmm" id="osstmm" component="select">
                  <option value="i2i">Inside to inside</option>
                  <option value="o2o">Outside to outside</option>
                  <option value="o2i">Outside to inside</option>
                </Field>
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

AddAssessmentPage.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default AddAssessmentPage;
