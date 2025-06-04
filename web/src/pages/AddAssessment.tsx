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
import SelectWrapper from "../components/Form/SelectWrapper";

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
            <FormField label="Assessment Type" singleChild>
              <SelectWrapper
                id="assessment_type"
                options={[
                  { value: "vapt", label: "Vulnerability Assessment Penetration Test" },
                  { value: "wapt", label: "Web Application Penetration Test" },
                  { value: "mapt", label: "Mobile Application Penetration Test" },
                  { value: "npt", label: "Network Penetration Test" },
                  { value: "rt", label: "Red Team" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected assessment type:", option.value)}
              />
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

            <FormField label="CVSS Version" singleChild>
              <SelectWrapper
                id="cvss_version"
                options={[
                  { value: "4", label: "4" },
                  { value: "3.1", label: "3.1" },
                  { value: "2", label: "2" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected CVSS version:", option.value)}
              />
            </FormField>

            <FormField label="Environment" singleChild>
              <SelectWrapper
                id="environment"
                options={[
                  { value: "pre", label: "Pre-Production" },
                  { value: "prod", label: "Production" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected environment:", option.value)}
              />
            </FormField>

            <FormField label="Testing type" singleChild>
              <SelectWrapper
                id="testing_type"
                options={[
                  { value: "white", label: "White Box" },
                  { value: "gray", label: "Gray Box" },
                  { value: "black", label: "Black Box" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected testing type:", option.value)}
              />
            </FormField>

            <FormField label="OSSTMM Vector" singleChild>
              <SelectWrapper
                id="osstmm_vector"
                options={[
                  { value: "i2i", label: "Inside to inside" },
                  { value: "o2o", label: "Outside to outside" },
                  { value: "o2i", label: "Outside to inside" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected OSSTMM vector:", option.value)}
              />
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
