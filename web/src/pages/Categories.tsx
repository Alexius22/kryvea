import { mdiCogs, mdiDeleteAlert, mdiDownload, mdiPencil, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Card from "../components/CardBox/Card";
import CardBoxModal from "../components/CardBox/CardBoxModal";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
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
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure you want to proceed with the deletion?</p>
      </CardBoxModal>
      <CardBoxModal
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
                <Button type="primary" icon={mdiDownload} text="Export categories" small onClick={() => navigate("")} />
                <Button
                  icon={mdiDeleteAlert}
                  type="danger"
                  text="Delete all categories"
                  small
                  onClick={() => setIsModalTrashAllActive(true)}
                />
              </Buttons>
              <Divider />
              <Input label="Import categories" type="file" id="imported_categories" accept=".json" />
              <div className="inline-flex items-center">
                <input type="checkbox" className="h-5 w-5 cursor-pointer" id="override_categories" />
                <label className="ml-2 cursor-pointer text-sm" htmlFor="override_categories">
                  Override existing categories
                </label>
              </div>
            </Grid>
          </Form>
        </Formik>
      </CardBoxModal>
      <CardBoxModal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashAllActive}
        onConfirm={handleModalAction}
        onCancel={handleModalTrashAll}
      >
        <p>Are you sure you want to proceed with the deletion?</p>
      </CardBoxModal>
      <SectionTitleLineWithButton icon={mdiTabSearch} title="Categories">
        <Buttons>
          <Button icon={mdiPlus} text="New category" small onClick={() => navigate("/manage_category")} />
          <Button icon={mdiCogs} text="Categories management" small onClick={() => setIsModalManageActive(true)} />
        </Buttons>
      </SectionTitleLineWithButton>
      <Card className="!p-0">
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
                  <Button type="primary" icon={mdiPencil} small onClick={() => navigate("/manage_category")} />
                  <Button type="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={50}
          />
        )}
      </Card>
    </div>
  );
};

export default Categories;
