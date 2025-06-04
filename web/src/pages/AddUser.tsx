import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import { getPageTitle } from "../config";
import { users } from "../mockup_data/users";
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
    <CardBox>
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
                <Field name="username" id="username" placeholder="username" />
              </FormField>
              <FormField label="Email" help="Required">
                <Field name="email" id="email" placeholder="example@email.com" />
              </FormField>
              <FormField label="Role" labelFor="role" singleChild>
                <SelectWrapper
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
              </FormField>
              <FormField label="Customers" singleChild>
                <SelectWrapper
                  options={[selectAllOption, ...customerOptions]}
                  isMulti
                  value={customerOptions.filter(option => values.customers.includes(option.value))}
                  onChange={handleSelectChange}
                  closeMenuOnSelect={false}
                  id="customer-selection"
                />
              </FormField>
              <Divider />
              <Buttons>
                <Button type="submit" label="Submit" />
                <Button type="reset" outline label="Cancel" />
              </Buttons>
            </Form>
          );
        }}
      </Formik>
    </CardBox>
  );
};

export default AddUser;
