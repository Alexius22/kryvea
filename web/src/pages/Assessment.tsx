import { mdiDownload, mdiFileEye, mdiListBox, mdiPencil, mdiPlus, mdiTrashCan, mdiUpload } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Card from "../components/CardBox/Card";
import CardBoxModal from "../components/CardBox/CardBoxModal";
import Grid from "../components/Composition/Grid";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
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
        title="Upload file"
        buttonLabel="Confirm"
        isActive={isModalUploadActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Input
          type="file"
          id="nessus_file"
          placeholder="Drop here also"
          label="Choose bulk file"
          accept={".nessus,text/xml"}
        />
      </CardBoxModal>
      <CardBoxModal
        title="Please confirm"
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
          <Button icon={mdiFileEye} text="Live editor" small disabled onClick={() => navigate("/live_editor")} />
          <Button icon={mdiDownload} text="Download report" small onClick={() => setIsModalDownloadActive(true)} />
          <Button icon={mdiPlus} text="New host" small onClick={() => navigate("/add_host")} />
          <Button icon={mdiPlus} text="New vulnerability" small onClick={() => navigate("/add_vulnerability")} />
          <Button icon={mdiUpload} text="Upload" small onClick={() => setIsModalUploadActive(true)} />
        </Buttons>
      </SectionTitleLineWithButton>
      <Card className="!p-0">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={vulnerabilities.map(vulnerability => ({
              Vulnerability: (
                <Link to={`/vulnerability`}>
                  {vulnerability.category.index + ": " + vulnerability.category.name} ({vulnerability.detailed_title})
                </Link>
              ),
              Host:
                vulnerability.target.ip + (vulnerability.target.hostname ? " - " + vulnerability.target.hostname : ""),
              "CVSS Score": vulnerability.cvss_score,
              buttons: (
                <Buttons noWrap>
                  <Button icon={mdiPencil} small onClick={() => navigate("/add_vulnerability")} />
                  <Button type="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={10}
          />
        )}
      </Card>
    </div>
  );
};

export default Assessment;
