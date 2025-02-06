import { Field, Form, Formik } from "formik";
import { useEffect } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionMain from "../components/Section/Main";
import { getPageTitle } from "../config";
import { users } from "../mockup_data/users";

const AddUser = () => {
  useEffect(() => {
    document.title = getPageTitle("User");
  }, []);

  const customerOptions = users.flatMap(user =>
    user.customers.map((customer, index) => ({
      value: customer,
      label: customer,
    }))
  );
  const selectAllOption = { value: "all", label: "Select All" };

  return (
    <>
      <SectionMain>
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
                  <FormField label="Role" labelFor="role">
                    <Field name="role" id="role" component="select">
                      <option value="administrator">Administrator</option>
                      <option value="user">User</option>
                    </Field>
                  </FormField>
                  <FormField label="Customers">
                    <SelectWrapper
                      options={[selectAllOption, ...customerOptions]}
                      isMulti
                      value={customerOptions.filter(option => values.customers.includes(option.value))}
                      onChange={handleSelectChange}
                      closeMenuOnSelect={false}
                    />
                  </FormField>
                  <Divider />
                  <Buttons>
                    <Button type="submit" color="info" label="Submit" />
                    <Button type="cancel" color="info" outline label="Cancel" />
                  </Buttons>
                </Form>
              );
            }}
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

export default AddUser;
