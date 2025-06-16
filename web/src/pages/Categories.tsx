import { mdiCogs, mdiDeleteAlert, mdiDownload, mdiPencil, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import UploadFile from "../components/Form/UploadFile";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { categories } from "../mockup_data/categories";

export default function Categories() {
  const navigate = useNavigate();
  // const { data: categories, loading, error } = useFetch<Category[]>("/api/categories");
  const loading = false;
  const error = false;

  const [isModalManageActive, setIsModalManageActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [isModalTrashAllActive, setIsModalTrashAllActive] = useState(false);
  const handleModalAction = () => {
    setIsModalManageActive(false);
    setIsModalTrashActive(false);
    setIsModalTrashAllActive(false);
  };
  const handleModalTrashAll = () => {
    setIsModalTrashAllActive(false);
  };
  const [fileObj, setFileObj] = useState<File>();

  const changeFile = ({ target: { files } }) => {
    if (!files || !files[0]) {
      return;
    }

    const file: File = files[0];
    setFileObj(file);
  };

  const clearFile = () => {
    setFileObj(null);
  };

  useEffect(() => {
    document.title = getPageTitle("Categories");
  }, []);
  return (
    <div>
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure you want to proceed with the deletion?</p>
      </Modal>
      <Modal
        title="Categories management"
        buttonLabel="Confirm"
        isActive={isModalManageActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <Grid className="gap-4">
              <Buttons>
                <Button icon={mdiDownload} text="Export categories" small onClick={() => navigate("")} />
                <Button
                  icon={mdiDeleteAlert}
                  type="danger"
                  text="Delete all categories"
                  small
                  onClick={() => setIsModalTrashAllActive(true)}
                />
              </Buttons>
              <Divider />
              <UploadFile
                inputId={"imported_categories"}
                filename={fileObj?.name}
                name={"categories"}
                accept={".json"}
                onChange={changeFile}
                onButtonClick={clearFile}
              />
              <Checkbox
                id={"override_categories"}
                onChange={{}}
                htmlFor={"override_categories"}
                label={"Override existing categories"}
              />
            </Grid>
          </Form>
        </Formik>
      </Modal>
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashAllActive}
        onConfirm={handleModalAction}
        onCancel={handleModalTrashAll}
      >
        <p>Are you sure you want to proceed with the deletion?</p>
      </Modal>
      <SectionTitleLineWithButton icon={mdiTabSearch} title="Categories">
        <Buttons>
          <Button icon={mdiPlus} text="New category" small onClick={() => navigate("/manage_category")} />
          <Button icon={mdiCogs} text="Categories management" small onClick={() => setIsModalManageActive(true)} />
        </Buttons>
      </SectionTitleLineWithButton>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={categories.map(category => ({
              Identifier: category.index,
              Name: category.name,
              Source: category.source,
              Languages: Object.keys(category.generic_description || {})
                .join(" | ")
                .toUpperCase(),
              buttons: (
                <Buttons noWrap>
                  <Button icon={mdiPencil} small onClick={() => navigate("/manage_category")} />
                  <Button type="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={50}
          />
        )}
      </div>
    </div>
  );
}
