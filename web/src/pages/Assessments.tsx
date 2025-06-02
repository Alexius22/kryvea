import { mdiContentDuplicate, mdiDownload, mdiFileEdit, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import { formatDate } from "../components/DateUtils";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { assessments } from "../mockup_data/assessments";
import { Assessment } from "../types/common.types";

const Assessments = () => {
  const navigate = useNavigate();
  const loading = false;
  const error = false;

  const [isModalDownloadActive, setIsModalDownloadActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [isModalCloneActive, setIsModalCloneActive] = useState(false);
  const [assessmentToClone, setAssessmentToClone] = useState<Assessment>();
  const handleModalAction = () => {
    setIsModalDownloadActive(false);
    setIsModalCloneActive(false);
    setIsModalTrashActive(false);
  };
  const openCloneModal = (assessment: Assessment) => {
    setAssessmentToClone(assessment);
    setIsModalCloneActive(true);
  };
  const [statusSelectOptions, setStatusSelectOptions] = useState<SelectOption[]>([
    { label: "On Hold", value: "hold" },
    { label: "In Progress", value: "progress" },
    { label: "Completed", value: "completed" },
  ]);
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | SelectOption[]>(null);
  const [assessmentsData, setAssessmentsData] = useState<Assessment[]>(assessments as Assessment[]);

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
    <div>
      <CardBoxModal
        title="Clone assessment"
        buttonLabel="Confirm"
        isActive={isModalCloneActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik initialValues={{ name: assessmentToClone?.name + " (Copy)" }} onSubmit={undefined}>
          <Form>
            <FormField label="Assessment Name">
              <Field name="name" placeholder="Cloned assessment name" />
            </FormField>
          </Form>
        </Formik>
      </CardBoxModal>
      <CardBoxModal
        title="Download report"
        buttonLabel="Confirm"
        isActive={isModalDownloadActive}
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
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>
          <b>Action irreversible</b>: Are you sure to delete this assessment?
        </p>
      </CardBoxModal>

      <SectionTitleLineWithButton icon={mdiTabSearch} title="Assessments">
        <Button icon={mdiPlus} label="New assessment" roundedFull small onClick={() => navigate("/add_assessment")} />
      </SectionTitleLineWithButton>
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={assessmentsData.map(assessment => ({
              Title: <span onClick={() => navigate(`/assessment`)}>{assessment.name}</span>,
              Type: assessment.assessment_type,
              "CVSS Version": assessment.cvss_version,
              "Vuln count": assessment.vulnerability_count,
              Start: formatDate(assessment.start_date_time),
              End: formatDate(assessment.end_date_time),
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
                    color={assessment.is_owned ? "bg-yellow-500 dark:bg-yellow-500" : ""}
                    icon={mdiStar}
                    onClick={handleFavoriteToggle(assessment.id)}
                    small
                  />
                  <Button icon={mdiFileEdit} onClick={() => navigate(`/add_assessment`)} small />
                  <Button icon={mdiContentDuplicate} onClick={() => openCloneModal(assessment)} small />
                  <Button icon={mdiDownload} onClick={() => setIsModalDownloadActive(true)} small />
                  <Button
                    className="trash-button"
                    icon={mdiTrashCan}
                    onClick={() => setIsModalTrashActive(true)}
                    small
                  />
                </Buttons>
              ),
            }))}
            perPageCustom={50}
          />
        )}
      </CardBox>
    </div>
  );
};

export default Assessments;
