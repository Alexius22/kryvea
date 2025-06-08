import { Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { getPageTitle } from "../config";
import { customers } from "../mockup_data/customers";

const AddUser = () => {
  useEffect(() => {
    document.title = getPageTitle("User");
  }, []);

  const customerOptions = customers.map(customer => ({
    label: customer.name,
    value: customer.id,
  }));
  const selectAllOption = { value: "all", label: "Select All" };

  return (
    <Card>
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
                <Input type="email" label="Email" placeholder="example@email.com" id="email" />
                <SelectWrapper
                  label="Role"
                  id="role-selection"
                  options={[
                    { value: "administrator", label: "Administrator" },
                    { value: "user", label: "User" },
                  ]}
                  closeMenuOnSelect
                  onChange={option => setFieldValue("role", option.value)}
                  value={
                    values.role
                      ? { value: values.role, label: values.role.charAt(0).toUpperCase() + values.role.slice(1) }
                      : null
                  }
                />
                <SelectWrapper
                  label="Customers"
                  options={[selectAllOption, ...customerOptions]}
                  isMulti
                  value={customerOptions.filter(option => values.customers.includes(option.value))}
                  onChange={handleSelectChange}
                  closeMenuOnSelect={false}
                  id="customer-selection"
                />
                <Divider />
                <Buttons>
                  <Button type="primary" text="Submit" onClick={() => {}} />
                  <Button type="secondary" text="Cancel" onClick={() => {}} />
                </Buttons>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </Card>
  );
};

export default AddUser;
