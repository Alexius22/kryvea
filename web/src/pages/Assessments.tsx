import { mdiDownload, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import { Assessment } from "../types/common.types";
import { formatDate } from "../components/DateUtils";

const Assessments = () => {
  const navigate = useNavigate();
  const loading = false;
  const error = false;
  const owners = ["Owner1", "Owner2", "Owner3"];

  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };
  const [statusSelectOptions, setStatusSelectOptions] = useState<SelectOption[]>([
    { label: "On Hold", value: "hold" },
    { label: "In Progress", value: "progress" },
    { label: "Completed", value: "completed" },
  ]);
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | SelectOption[]>(null);
  const [assessmentsData, setAssessmentsData] = useState<Assessment[]>([
    {
      id: "64b9b35b8f8e4b7a84c7f1a0",
      created_at: "2023-01-01T10:00:00Z",
      updated_at: "2023-12-10T14:00:00Z",
      name: "Landing Page",
      notes: "Focus on the authentication and authorization modules.",
      start_date_time: "2023-01-15T09:00:00Z",
      end_date_time: "2023-01-20T17:00:00Z",
      targets: ["64b9b35b8f8e4b7a84c7f1a1", "64b9b35b8f8e4b7a84c7f1a2"],
      status: "Completed",
      type: "Web Application Penetration Test",
      cvss_version: 31,
      environment: "Production",
      network: "Internal",
      method: "Black Box",
      osstmm_vector: "Inside to Inside",
      customer_id: "64b9b35b8f8e4b7a84c7f19a",
      is_owned: false,
    },
    {
      id: "64b9b35b8f8e4b7a84c7f1a3",
      created_at: "2023-02-01T12:00:00Z",
      updated_at: "2023-12-01T16:00:00Z",
      name: "Corporate Network",
      notes: "Assess open ports and patch vulnerabilities.",
      start_date_time: "2023-02-10T08:00:00Z",
      end_date_time: "2023-02-15T18:00:00Z",
      targets: ["64b9b35b8f8e4b7a84c7f1a4"],
      status: "In Progress",
      type: "Network Penetration Test",
      cvss_version: 31,
      environment: "Staging",
      network: "External",
      method: "Gray Box",
      osstmm_vector: "Outside to Inside",
      customer_id: "64b9b35b8f8e4b7a84c7f19b",
      is_owned: false,
    },
    {
      id: "64b9b35b8f8e4b7a84c7f1a5",
      created_at: "2023-03-05T14:30:00Z",
      updated_at: "2023-12-15T12:45:00Z",
      name: "BEEPER Mobile App",
      notes: "Emphasis on data storage and encryption.",
      start_date_time: "2023-03-20T10:00:00Z",
      end_date_time: "2023-03-25T16:00:00Z",
      targets: ["64b9b35b8f8e4b7a84c7f1a6", "64b9b35b8f8e4b7a84c7f1a7"],
      status: "In Progress",
      type: "Mobile Application Penetration Test",
      cvss_version: 40,
      environment: "Production",
      network: "Wireless",
      method: "White Box",
      osstmm_vector: "Gay to Gay",
      customer_id: "64b9b35b8f8e4b7a84c7f19c",
      is_owned: false,
    },
    {
      id: "64b9b35b8f8e4b7a84c7f1a8",
      created_at: "2023-04-10T09:45:00Z",
      updated_at: "2023-12-20T10:15:00Z",
      name: "BEEPER AWS",
      notes: "Focus on AWS environment and IAM policies.",
      start_date_time: "2023-04-15T11:00:00Z",
      end_date_time: "2023-04-20T17:30:00Z",
      targets: ["64b9b35b8f8e4b7a84c7f1a9"],
      status: "Completed",
      type: "API Penetration Test",
      cvss_version: 40,
      environment: "Staging",
      network: "Hybrid",
      method: "Black Box",
      osstmm_vector: "Outside to Outside",
      customer_id: "64b9b35b8f8e4b7a84c7f19d",
      is_owned: false,
    },
    {
      id: "64b9b35b8f8e4b7a84c7f1aa",
      created_at: "2023-05-01T15:00:00Z",
      updated_at: "2023-12-25T13:30:00Z",
      name: "Scaldaacqua IoT",
      notes: "Verify firmware updates and network traffic encryption.",
      start_date_time: "2023-05-10T09:00:00Z",
      end_date_time: "2023-05-15T18:00:00Z",
      targets: ["64b9b35b8f8e4b7a84c7f1ab", "64b9b35b8f8e4b7a84c7f1ac"],
      status: "Completed",
      type: "IoT Penetration Test",
      cvss_version: 31,
      environment: "Production",
      network: "LAN",
      method: "White Box",
      osstmm_vector: "",
      customer_id: "64b9b35b8f8e4b7a84c7f19e",
      is_owned: false,
    },
  ]);

  useEffect(() => {
    document.title = getPageTitle("Assessments");
  }, []);

  const handleFavoriteToggle = id => () => {
    setAssessmentsData(
      assessmentsData.map(assessment => {
        if (assessment.id === id) {
          assessment.is_owned = !assessment.is_owned;
        }
        return assessment;
      })
    );
  };

  return (
    <>
      <CardBoxModal
        title="Download report"
        buttonColor="info"
        buttonLabel="Confirm"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <FormField label="Type" icons={[]}>
              <Field name="type" component="select">
                <option value="word">Word (.docx)</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="zip">Archive (.zip)</option>
              </Field>
            </FormField>
            <FormField label="Encryption">
              <Field name="encryption" component="select">
                <option value="none">None</option>
                <option value="password">Password</option>
              </Field>
              <Field name="password" placeholder="Insert password" />
            </FormField>
            <FormField label="Options">
              <Field name="options" placeholder="TODO" />
            </FormField>
          </Form>
        </Formik>
      </CardBoxModal>
      <CardBoxModal
        title="Please confirm"
        buttonColor="danger"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure to delete this assessment?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiTabSearch} title="Assessments">
          <Button
            icon={mdiPlus}
            label="New assessment"
            roundedFull
            small
            color="contrast"
            onClick={() => navigate("/add_assessment")}
          />
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={assessmentsData.map(assessment => ({
                Title: (
                  <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={() => navigate(`/assessment`)}
                  >
                    {assessment.name}
                  </span>
                ),
                Type: assessment.type,
                "CVSS Version": assessment.cvss_version,
                //"Vuln count": ,
                Start: formatDate(assessment.start_date_time),
                End: formatDate(assessment.end_date_time),
                Owners: (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto auto",
                      columnGap: "1rem",
                      justifyContent: "start",
                    }}
                  >
                    {owners.flatMap((owner, index, arr) =>
                      index > 1
                        ? []
                        : [
                            <div key={"table-owner-col-" + index}>
                              {index === 1 && arr.length > 2 ? `${owner} ...` : owner}
                            </div>,
                          ]
                    )}
                  </div>
                ),
                Status: (
                  <SelectWrapper
                    options={statusSelectOptions}
                    onChange={selectedOptions => setSelectedStatus(selectedOptions)}
                    defaultValue={{ label: "On Hold", value: "hold" }}
                  />
                ),
                buttons: (
                  <Buttons noWrap>
                    <Button
                      color={assessment.is_owned ? "warning" : "info"}
                      icon={mdiStar}
                      onClick={handleFavoriteToggle(assessment.id)}
                      small
                    />
                    <Button color="success" icon={mdiDownload} onClick={() => setIsModalInfoActive(true)} small />
                    <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                  </Buttons>
                ),
              }))}
              perPageCustom={50}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Assessments;
