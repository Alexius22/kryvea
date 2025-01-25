import { mdiEye, mdiListBox, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState, type ReactElement } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/LayoutAuthenticated";
import { Field, Form, Formik } from "formik";
import FormField from "../components/Form/Field";
import { GlobalContext } from "../../App";

const Customers = () => {
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const {
    useCustomerName: [_, setCustomerName],
  } = useContext(GlobalContext);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Customers");
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
        <p>Are you sure to delete this customer?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiListBox} title="Customers">
          <Button icon={mdiPlus} label="New customer" roundedFull small color="contrast" href="/add_customer" />
        </SectionTitleLineWithButton>
        <Formik
          initialValues={{
            search: "",
          }}
          onSubmit={values => alert(JSON.stringify(values, null, 2))}
        >
          <Form className="mb-2">
            <FormField isBorderless noHeight>
              <Field className="input-style" name="search" placeholder="Search" />
            </FormField>
          </Form>
        </Formik>
        <CardBox hasTable>
          <Table
            data={Array(21)
              .fill(0)
              .map((el, i) => ({
                Name: (
                  <span
                    className="cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={() => setCustomerName("customer" + i + 1)}
                  >
                    {i + 1}
                  </span>
                ),
                Host: i + 2,
                Assessments: i + 3,
                Language: i + 4,
              }))}
            buttons={
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button
                    color="info"
                    icon={mdiEye}
                    onClick={() => setIsModalInfoActive(true)}
                    small
                    href="/customer"
                  />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              </td>
            }
            perPageCustom={100}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Customers;
