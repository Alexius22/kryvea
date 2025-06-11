import { mdiContentDuplicate, mdiDownload, mdiFileEdit, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Card from "../components/CardBox/Card";
import CardBoxModal from "../components/CardBox/CardBoxModal";
import Grid from "../components/Composition/Grid";
import { formatDate } from "../components/DateUtils";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
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
            <Input type="text" label="Assessment Name" placeholder="Cloned assessment name" id="assessment_name" />
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
            <Grid>
              <SelectWrapper
                label="Type"
                id="type"
                options={[
                  { value: "word", label: "Word (.docx)" },
                  { value: "excel", label: "Excel (.xlsx)" },
                  { value: "zip", label: "Archive (.zip)" },
                ]}
                onChange={option => console.log("Selected type:", option.value)}
              />
              <Grid className="grid-cols-2">
                <SelectWrapper
                  label="Encryption"
                  id="encryption"
                  options={[
                    { value: "none", label: "None" },
                    { value: "password", label: "Password" },
                  ]}
                  onChange={option => console.log("Selected encryption:", option.value)}
                />
                <Input type="password" id="password" placeholder="Insert password" />
              </Grid>
            </Grid>
          </Form>
        </Formik>
      </CardBoxModal>
      <CardBoxModal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure to delete this assessment?</p>
      </CardBoxModal>

      <SectionTitleLineWithButton icon={mdiTabSearch} title="Assessments">
        <Button icon={mdiPlus} text="New assessment" small onClick={() => navigate("/add_assessment")} />
      </SectionTitleLineWithButton>
      {loading ? (
        <Card>
          <p>Loading...</p>
        </Card>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <Table
          data={assessmentsData.map(assessment => ({
            Title: <Link to={`/assessment`}>{assessment.name}</Link>,
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
                  type={assessment.is_owned ? "warning" : "primary"}
                  icon={mdiStar}
                  onClick={handleFavoriteToggle(assessment.id)}
                  small
                />
                <Button icon={mdiFileEdit} onClick={() => navigate(`/add_assessment`)} small />
                <Button icon={mdiContentDuplicate} onClick={() => openCloneModal(assessment)} small />
                <Button icon={mdiDownload} onClick={() => setIsModalDownloadActive(true)} small />
                <Button type="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
              </Buttons>
            ),
          }))}
          perPageCustom={50}
        />
      )}
    </div>
  );
};

export default Assessments;
