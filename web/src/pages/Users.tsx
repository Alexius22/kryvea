import { mdiAccountEdit, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormCheckRadio from "../components/Form/CheckRadio";
import FormCheckRadioGroup from "../components/Form/CheckRadioGroup";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { users } from "../mockup_data/users";
import Select from "react-select/base";

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

  const customerOptions = users.flatMap(user =>
    user.customers.map((customer, index) => ({
      value: customer.name,
      label: customer.name,
    }))
  );

  const selectAllOption = { value: "all", label: "Select All" };

  return (
    <div>
      <CardBoxModal
        title="Edit user"
        buttonLabel="Confirm"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik
          initialValues={{ username: "", role: "", customers: [], active_user: true }}
          onSubmit={values => console.log("Submitted values:", values)}
        >
          {({ setFieldValue, values }) => {
            const handleSelectChange = selectedOptions => {
              if (selectedOptions.some(option => option.value === "all")) {
                setFieldValue(
                  "customers",
                  customerOptions.map(option => option.value)
                );
              } else {
                setFieldValue(
                  "customers",
                  selectedOptions.map(option => option.value)
                );
              }
            };

            return (
              <Form>
                <FormField label="Username" help="Required">
                  <Field name="username" placeholder="username" id="username" />
                </FormField>

                <FormField label="Role" singleChild>
                  <SelectWrapper
                    id="role-selection"
                    options={[
                      { value: "administrator", label: "Administrator" },
                      { value: "user", label: "User" },
                    ]}
                    onChange={option => setFieldValue("role", option.value)}
                    value={
                      values.role
                        ? { value: values.role, label: values.role.charAt(0).toUpperCase() + values.role.slice(1) }
                        : null
                    }
                  />
                </FormField>
                <FormField label="Customers" singleChild>
                  <SelectWrapper
                    options={[selectAllOption, ...customerOptions]}
                    isMulti
                    value={customerOptions.filter(option => values.customers.includes(option.value))}
                    onChange={handleSelectChange}
                    closeMenuOnSelect={false}
                  />
                </FormField>
                <FormCheckRadioGroup>
                  <FormCheckRadio type="checkbox" label="Disable user">
                    <Field type="checkbox" name="disable_user" />
                  </FormCheckRadio>
                </FormCheckRadioGroup>
              </Form>
            );
          }}
        </Formik>
      </CardBoxModal>
      <CardBoxModal
        title="Please confirm"
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

      <SectionTitleLineWithButton icon={mdiListBox} title="Users">
        <Button icon={mdiPlus} label="New user" roundedFull small onClick={() => navigate("/add_user")} />
      </SectionTitleLineWithButton>
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={users.map(user => ({
              Username: user.username,
              Role: user.role,
              Customers: user.customers.map(customer => customer.name).join(" | "),
              Active: Date.parse(user.disabled_at) > Date.now() ? "True" : "False",
              buttons: (
                <Buttons noWrap>
                  <Button icon={mdiAccountEdit} onClick={() => setIsModalInfoActive(true)} small />
                  <Button
                    className="trash-button"
                    icon={mdiTrashCan}
                    onClick={() => setIsModalTrashActive(true)}
                    small
                  />
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

export default Users;
