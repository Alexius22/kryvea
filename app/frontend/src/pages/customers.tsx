import { mdiEye, mdiListBox, mdiPlus, mdiTabSearch, mdiTrashCan } from "@mdi/js";
import Head from "next/head";
import { useContext, useState, type ReactElement } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import LayoutAuthenticated from "../layouts/Authenticated";
import { Field, Form, Formik } from "formik";
import FormField from "../components/Form/Field";
import { GlobalContext } from "./_app";

const CustomersList = () => {
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const {
    useCustomerName: [_, setCustomerName],
  } = useContext(GlobalContext);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

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
      <Head>
        <title>{getPageTitle("Customers")}</title>
      </Head>
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
            <FormField isBorderless>
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
                    className="cursor-pointer hover:underline hover:text-blue-500"
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
              <td className="before:hidden lg:w-1 whitespace-nowrap">
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

CustomersList.getLayout = function getLayout(page: ReactElement) {
  return <LayoutAuthenticated>{page}</LayoutAuthenticated>;
};

export default CustomersList;
