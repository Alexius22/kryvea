import { mdiAccountEdit, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormCheckRadio from "../components/Form/CheckRadio";
import FormCheckRadioGroup from "../components/Form/CheckRadioGroup";
import FormField from "../components/Form/Field";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";

const Users = () => {
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Users");
  }, []);

  return (
    <>
      <CardBoxModal
        title="Edit user"
        buttonColor="info"
        buttonLabel="Confirm"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik
          initialValues={{
            username: "TestUser",
            role: "Administrator",
          }}
          onSubmit={values => alert(JSON.stringify(values, null, 2))}
        >
          <Form>
            <FormField label="Username" help="Required">
              <Field name="username" placeholder="username" id="username" />
            </FormField>

            <FormField label="Role">
              <Field id="role" component="select">
                <option value="administrator">Administrator</option>
                <option value="user">User</option>
              </Field>
            </FormField>
            <FormField label="Customers">
              <Field id="customers" component="select">
                <option value="customer1">customer1</option>
                <option value="customer2">customer2</option>
              </Field>
            </FormField>
            <FormField label="User enabled">
              <FormCheckRadioGroup>
                <FormCheckRadio type="checkbox" label="Active">
                  <Field checked type="checkbox" name="active_user" value="active" />
                </FormCheckRadio>
              </FormCheckRadioGroup>
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
        <p>Are you sure to delete this user?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiListBox} title="Users">
          <Button icon={mdiPlus} label="New user" roundedFull small color="contrast" href="/add_user" />
        </SectionTitleLineWithButton>
        <Formik
          initialValues={{
            search: "",
          }}
          onSubmit={values => alert(JSON.stringify(values, null, 2))}
        >
          <Form className="mb-2">
            <FormField isBorderless isTransparent>
              <Field name="search" placeholder="Search" />
            </FormField>
          </Form>
        </Formik>
        <CardBox hasTable>
          <Table
            data={Array(21)
              .fill(0)
              .map((el, i) => ({
                Username: i + 1,
                Role: i + 1,
                Customers: i + 1,
                Active: i + 1,
              }))}
            buttons={
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button color="info" icon={mdiAccountEdit} onClick={() => setIsModalInfoActive(true)} small />
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

export default Users;
