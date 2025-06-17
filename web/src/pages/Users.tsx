import { mdiAccountEdit, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { customers } from "../mockup_data/customers";
import { users } from "../mockup_data/users";

export default function Users() {
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

  const customerOptions = customers.map((customer, index) => ({
    value: customer.name,
    label: customer.name,
  }));

  const selectAllOption = { value: "all", label: "Select All" };

  return (
    <div>
      <Modal
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
                <Grid className="gap-4">
                  <Input type="text" label="Username" placeholder="username" id="username" />
                  <SelectWrapper
                    label="Role"
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
                  <SelectWrapper
                    label="Customers"
                    id="modal-select-customers"
                    options={[selectAllOption, ...customerOptions]}
                    isMulti
                    value={customerOptions.filter(option => values.customers.includes(option.value))}
                    onChange={handleSelectChange}
                    closeMenuOnSelect={false}
                  />
                  <Checkbox id={"disable_user"} onChange={{}} htmlFor={"disable_user"} label={"Disable user"} />
                </Grid>
              </Form>
            );
          }}
        </Formik>
      </Modal>
      <Modal
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
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title="Users">
        <Button icon={mdiPlus} text="New user" small onClick={() => navigate("/add_user")} />
      </SectionTitleLineWithButton>
      <div>
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
