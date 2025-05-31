import { mdiCogs, mdiDeleteAlert, mdiDownload, mdiPencil, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import Divider from "../components/Divider";
import FormCheckRadio from "../components/Form/CheckRadio";
import FormCheckRadioGroup from "../components/Form/CheckRadioGroup";
import FormField from "../components/Form/Field";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import { categories } from "../mockup_data/categories";

const Categories = () => {
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

  useEffect(() => {
    document.title = getPageTitle("Categories");
  }, []);
  return (
    <div>
      <CardBoxModal
        title="Please confirm"
        buttonColor="danger"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure you want to proceed with the deletion?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <CardBoxModal
        title="Categories management"
        buttonColor="info"
        buttonLabel="Confirm"
        isActive={isModalManageActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <Buttons>
              <Button
                icon={mdiDownload}
                label="Export categories"
                roundedFull
                small
                color="contrast"
                onClick={() => navigate("")}
              />
              <Button
                icon={mdiDeleteAlert}
                label="Delete all categories"
                roundedFull
                small
                color="danger"
                onClick={() => setIsModalTrashAllActive(true)}
              />
            </Buttons>
            <Divider />
            <FormField label="Import categories" icons={[]}>
              <input
                className="input-focus max-w-96 rounded dark:bg-slate-800"
                type="file"
                name="json"
                accept=".json"
              />
            </FormField>
            <FormCheckRadioGroup>
              <FormCheckRadio type="checkbox" label="Override existing categories">
                <Field type="checkbox" name="override" />
              </FormCheckRadio>
            </FormCheckRadioGroup>
          </Form>
        </Formik>
      </CardBoxModal>
      <CardBoxModal
        title="Please confirm: action irreversible"
        buttonColor="danger"
        buttonLabel="Confirm"
        isActive={isModalTrashAllActive}
        onConfirm={handleModalAction}
        onCancel={handleModalTrashAll}
      >
        <p>Are you sure you want to proceed with the deletion?</p>
      </CardBoxModal>
      <SectionTitleLineWithButton icon={mdiTabSearch} title="Categories">
        <Buttons>
          <Button
            icon={mdiPlus}
            label="New category"
            roundedFull
            small
            color="contrast"
            onClick={() => navigate("/manage_category")}
          />
          <Button
            icon={mdiCogs}
            label="Categories management"
            roundedFull
            small
            color="contrast"
            onClick={() => setIsModalManageActive(true)}
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
            data={categories.map(category => ({
              Identifier: category.index,
              Name: category.name,
              Source: category.source,
              Languages: Object.keys(category.generic_description || {})
                .join(" | ")
                .toUpperCase(),
              buttons: (
                <Buttons noWrap>
                  <Button color="info" icon={mdiPencil} small onClick={() => navigate("/manage_category")} />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
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

export default Categories;
