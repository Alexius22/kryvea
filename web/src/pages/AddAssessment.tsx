import { mdiPlus } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
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
            <Grid>
              <SelectWrapper
                label="Assessment Type"
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
              <Input type="text" label="Name" id="name" placeholder="Insert a name" />
              <Grid className="grid-cols-2 gap-4">
                <Input type="date" label="Activity period" id="start" />
                <Input type="date" id="end" />
              </Grid>

              <Grid className="grid-cols-[1fr_auto]">
                <Input type="text" label="Session targets" id="targets" placeholder="Insert a target" />
                <Button className="h-12" icon={mdiPlus} text="Add Host" onClick={() => navigate("/add_host")} />
              </Grid>

              <SelectWrapper
                label="CVSS Version"
                id="cvss_version"
                options={[
                  { value: "4", label: "4" },
                  { value: "3.1", label: "3.1" },
                  { value: "2", label: "2" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected CVSS version:", option.value)}
              />

              <SelectWrapper
                label="Environment"
                id="environment"
                options={[
                  { value: "pre", label: "Pre-Production" },
                  { value: "prod", label: "Production" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected environment:", option.value)}
              />

              <SelectWrapper
                label="Testing type"
                id="testing_type"
                options={[
                  { value: "white", label: "White Box" },
                  { value: "gray", label: "Gray Box" },
                  { value: "black", label: "Black Box" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected testing type:", option.value)}
              />

              <SelectWrapper
                label="OSSTMM Vector"
                id="osstmm_vector"
                options={[
                  { value: "i2i", label: "Inside to inside" },
                  { value: "o2o", label: "Outside to outside" },
                  { value: "o2i", label: "Outside to inside" },
                ]}
                closeMenuOnSelect
                onChange={option => console.log("Selected OSSTMM vector:", option.value)}
              />
            </Grid>

            <Divider />

            <Buttons>
              <Button type="primary" text="Submit" onClick={() => {}} />
              <Button type="secondary" text="Cancel" onClick={() => {}} />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default AddAssessment;
