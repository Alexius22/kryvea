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
import Input from "../components/Form/Input";

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
            <div className="grid gap-2">
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
              <div className="grid grid-cols-2 items-end gap-4">
                <Input type="date" label="Activity period" id="start" />
                <Input type="date" label="ASdasdASD" id="end" />
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-4">
                <Input type="text" label="Session targets" id="targets" placeholder="Insert a target" />
                <div className="mt-[2rem]">
                  <Button className="h-12" icon={mdiPlus} label="Add Host" onClick={() => navigate("/add_host")} />
                </div>
              </div>

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
            </div>

            <Divider />

            <Buttons>
              <Button type="submit" label="Submit" />
              <Button type="reset" label="Cancel" />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default AddAssessment;
