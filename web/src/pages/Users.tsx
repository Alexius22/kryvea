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
import useFetch from "../hooks/useFetch";
import { users } from "../mockup_data/users";
import { User } from "../types/common.types";
import { useNavigate } from "react-router";

const Users = () => {
  const navigate = useNavigate();
  //const { data: users, loading, error } = useFetch<User[]>("/users");
  const loading = false;
  const error = false;

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
        <Formik initialValues={undefined} onSubmit={undefined}>
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
          <Button
            icon={mdiPlus}
            label="New user"
            roundedFull
            small
            color="contrast"
            onClick={() => navigate("/add_user")}
          />
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={users.map(user => ({
                Username: user.username,
                Role: user.role,
                Customers: (
                  <td>
                    {" "}
                    <ul>
                      {user.customers.map((customer, index) => (
                        <li key={index}>{customer}</li>
                      ))}
                    </ul>
                  </td>
                ),
                Active: user.id,
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
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Users;
