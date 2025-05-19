import { mdiDownload, mdiFileEye, mdiListBox, mdiPencil, mdiPlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormField from "../components/Form/Field";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import { vulnerabilities } from "../mockup_data/vulnerabilities";

const Assessment = () => {
  const navigate = useNavigate();
  //const { data: vulnerabilities, loading, error } = useFetch<Vulnerability[]>("/api/vulnerabilities");
  const loading = false;
  const error = false;

  const [isModalDownloadActive, setIsModalDownloadActive] = useState(false);
  const [isModalUploadActive, setIsModalUploadActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalDownloadActive(false);
    setIsModalUploadActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Assessment");
  }, []);

  return (
    <div>
      <CardBoxModal
        title="Download report"
        buttonColor="info"
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
        title="Upload file"
        buttonColor="info"
        buttonLabel="Confirm"
        isActive={isModalUploadActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <FormField label="Choose Nessus file" icons={[]}>
              <input
                className="input-focus max-w-96 rounded dark:bg-slate-800"
                type="file"
                name="nessus"
                accept=".nessus"
              />
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

      <SectionTitleLineWithButton icon={mdiListBox} title="Assessment">
        <Buttons>
          <Button
            icon={mdiFileEye}
            label="Live editor"
            roundedFull
            small
            color="danger"
            onClick={() => navigate("/live_editor")}
          />
          <Button
            icon={mdiDownload}
            label="Download report"
            roundedFull
            small
            color="success"
            onClick={() => setIsModalDownloadActive(true)}
          />
          <Button
            icon={mdiPlus}
            label="New host"
            roundedFull
            small
            color="contrast"
            onClick={() => navigate("/add_host")}
          />
          <Button
            icon={mdiPlus}
            label="New vulnerability"
            roundedFull
            small
            color="contrast"
            onClick={() => navigate("/add_vulnerability")}
          />
          <Button
            icon={mdiUpload}
            label="Upload"
            roundedFull
            small
            color="contrast"
            onClick={() => setIsModalUploadActive(true)}
          />
        </Buttons>
      </SectionTitleLineWithButton>
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={vulnerabilities.map(vulnerability => ({
              Vulnerability: (
                <span
                  className="cursor-pointer hover:text-slate-500 hover:underline"
                  onClick={() => navigate(`/vulnerability`)}
                >
                  {vulnerability.category.id + ": " + vulnerability.category.name} ({vulnerability.detailed_title})
                </span>
              ),
              Host:
                vulnerability.target.ip + (vulnerability.target.hostname ? " - " + vulnerability.target.hostname : ""),
              "CVSS Score": vulnerability.cvss_score,
              buttons: (
                <Buttons noWrap>
                  <Button color="info" icon={mdiPencil} small onClick={() => navigate("/add_vulnerability")} />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={10}
          />
        )}
      </CardBox>
    </div>
  );
};

export default Assessment;
