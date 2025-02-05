import { mdiDownload, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import useFetch from "../hooks/useFetch";
import { assessments } from "../mockup_data/assessments";
import { Assessment } from "../types/common.types";
import { ColorButtonKey } from "../interfaces";

const Assessments = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  //const { data: assessment, loading, error } = useFetch<Assessment[]>(`/api/assessments/${id}`);
  const loading = false;
  const error = false;
  const owners = ["Owner1", "Owner2", "Owner3"];
  const [buttonColor, setButtonColor] = useState<ColorButtonKey>("info");

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

  useEffect(() => {
    document.title = getPageTitle("Assessments");
  }, []);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  console.log(buttonColor);
  const handleFavoriteToggle = (assessmentId: string) => {
    setButtonColor("warning");
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
        <p>Are you sure to delete this customer?</p>
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
              data={assessments.map(assessment => ({
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
                  <td className="whitespace-nowrap before:hidden lg:w-1">
                    <Buttons type="justify-start lg:justify-end" noWrap>
                      <Button
                        //key={`mark-favorite-${assessment.id}`}
                        color={buttonColor}
                        icon={mdiStar}
                        onClick={() => handleFavoriteToggle(assessment.id)}
                        small
                      />
                      <Button
                        key={`download-${assessment.id}`}
                        color="success"
                        icon={mdiDownload}
                        onClick={() => setIsModalInfoActive(true)}
                        small
                      />
                      <Button
                        key={`delete-${assessment.id}`}
                        color="danger"
                        icon={mdiTrashCan}
                        onClick={() => setIsModalTrashActive(true)}
                        small
                      />
                    </Buttons>
                  </td>
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
