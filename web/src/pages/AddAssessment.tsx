import { mdiCalendar, mdiPlus } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import { getPageTitle } from "../config";

const AddAssessment = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = getPageTitle("Add Assessment");
  }, []);

  return (
    <div>
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
                <Field name="targets" id="targets" placeholder="Insert a target" />
              </FormField>
              <div className="mt-[2rem]">
                <Button className="h-12" icon={mdiPlus} label="Add Host" onClick={() => navigate("/add_host")} />
              </div>
            </div>

            <FormField label="CVSS Version">
              <Field name="cvss_version" id="cvss_version" component="select">
                <option value="4">4</option>
                <option value="3.1">3.1</option>
                <option value="2">2</option>
              </Field>
            </FormField>

            <FormField label="Environment">
              <Field name="environment" id="environment" component="select">
                <option value="pre">Pre-Production</option>
                <option value="prod">Production</option>
              </Field>
            </FormField>

            <FormField label="Testing type">
              <Field name="testing_type" id="testing_type" component="select">
                <option value="white">White Box</option>
                <option value="gray">Gray Box</option>
                <option value="black">Black Box</option>
              </Field>
            </FormField>

            <FormField label="OSSTMM Vector">
              <Field name="osstmm_vector" id="osstmm_vector" component="select">
                <option value="i2i">Inside to inside</option>
                <option value="o2o">Outside to outside</option>
                <option value="o2i">Outside to inside</option>
              </Field>
            </FormField>

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

export default AddAssessment;
