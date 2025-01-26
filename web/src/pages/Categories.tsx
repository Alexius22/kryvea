import { mdiPencil, mdiPlus, mdiPlusBox, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import CardBox from "../components/CardBox";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import Buttons from "../components/Buttons";
import Button from "../components/Button";
import CardBoxModal from "../components/CardBox/Modal";

const Categories = () => {
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const handleModalAction = () => {
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Categories");
  }, []);
  return (
    <>
      <CardBoxModal
        title="Please confirm"
        buttonColor="danger"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <p>Are you sure to delete this vulnerability?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiTabSearch} title="Categories">
          <Button icon={mdiPlus} label="New category" roundedFull small color="contrast" href="/manage_category" />
        </SectionTitleLineWithButton>
        <Formik
          initialValues={{
            search: "",
          }}
          onSubmit={values => alert(JSON.stringify(values, null, 2))}
        >
          <Form className="mb-2">
            <FormField isBorderless isTransparent noHeight>
              <Field name="search" placeholder="Search" />
            </FormField>
          </Form>
        </Formik>
        <CardBox hasTable>
          <Table
            data={Array(21)
              .fill(0)
              .map((el, i) => ({
                Identifier: i + 1,
                Name: i + 1,
                Source: i + 1,
                Language: i + 1,
              }))}
            buttons={
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button color="info" icon={mdiPencil} small href="/manage_category" />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              </td>
            }
            perPageCustom={50}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Categories;
