import { mdiDownload, mdiFileEye, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import useFetch from "../hooks/useFetch";
import { vulnerabilities } from "../mockup_data/vulnerabilities";
import { Vulnerability } from "../types/common.types";

const Assessment = () => {
  const navigate = useNavigate();
  //const { data: vulnerabilities, loading, error } = useFetch<Vulnerability[]>("/api/vulnerabilities");
  const loading = false;
  const error = false;

  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Assessment");
  }, []);

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
              onClick={() => setIsModalInfoActive(true)}
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
          </Buttons>
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={vulnerabilities.map(vulnerability => ({
                Vulnerability: (
                  <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={() => navigate(`/vulnerability`)}
                  >
                    {vulnerability.category_id} ({vulnerability.detailed_title})
                  </span>
                ),
                Host: vulnerability.target_id,
                "CVSS Score": vulnerability.cvss_score,
                buttons: (
                  <Buttons noWrap>
                    <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                  </Buttons>
                ),
              }))}
              perPageCustom={10}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Assessment;
