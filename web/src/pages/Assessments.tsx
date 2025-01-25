import { mdiDownload, mdiPlus, mdiStar, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";

const Assessments = () => {
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Assessments");
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
          <Button icon={mdiPlus} label="New assessment" roundedFull small color="contrast" href="/add_assessment" />
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
                Title: i + 1,
                Type: i + 1,
                "CVSS Type": i + 1,
                "Vulnerabilties count": i + 1,
                Start: i + 1,
                End: i + 1,
                Owners: i + 1,
                Status: i + 1,
              }))}
            buttons={
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button color="info" icon={mdiStar} onClick={() => setIsModalInfoActive(true)} small href="" />
                  <Button color="success" icon={mdiDownload} onClick={() => setIsModalInfoActive(true)} small />
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

export default Assessments;
