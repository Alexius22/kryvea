import { mdiListBox, mdiNoteEdit, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GlobalContext } from "../App";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { customers } from "../mockup_data/customers";

const Customers = () => {
  const navigate = useNavigate();
  // const { data: customers, loading, error } = useFetch<Customer>(`/api/customers`);
  const loading = false;
  const error = false;
  const languageMapping: Record<string, string> = {
    en: "English",
    it: "Italian",
    fr: "French",
    de: "German",
    es: "Spanish",
  };

  const [isModalCustomerActive, setIsModalCustomerActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const {
    useCustomerName: [_, setCustomerName],
  } = useContext(GlobalContext);

  const handleModalAction = () => {
    setIsModalCustomerActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Customers");
  }, []);

  return (
    <div>
      <CardBoxModal
        title="Edit customer"
        buttonLabel="Confirm"
        isActive={isModalCustomerActive}
        onConfirm={handleModalAction}
        onCancel={handleModalAction}
      >
        <Formik
          initialValues={{
            companyName: "Test",
            language: "italian",
          }}
          onSubmit={undefined}
        >
          <Form>
            <FormField label="Company Name" help="Required">
              <Field name="companyName" placeholder="CompanyName" id="companyName" />
            </FormField>

            <FormField label="Language" labelFor="language" singleChild>
              <SelectWrapper
                id="language"
                options={[
                  { value: "italian", label: "Italian" },
                  { value: "english", label: "English" },
                ]}
                onChange={option => console.log("Selected language:", option.value)}
              />
            </FormField>

            <FormField label="Default CVSS Version" labelFor="cvss" singleChild>
              <SelectWrapper
                id="cvss"
                options={[
                  { value: "4", label: "4" },
                  { value: "3.1", label: "3.1" },
                  { value: "2", label: "2" },
                ]}
                onChange={option => console.log("Selected CVSS version:", option.value)}
              />
            </FormField>
          </Form>
        </Formik>
      </CardBoxModal>

      <CardBoxModal
        title="Please confirm"
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

      <SectionTitleLineWithButton icon={mdiListBox} title="Customers">
        <Button icon={mdiPlus} label="New customer" roundedFull small onClick={() => navigate("/add_customer")} />
      </SectionTitleLineWithButton>
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={customers.map(customer => ({
              Name: <span onClick={() => setCustomerName(customer.name)}>{customer.name}</span>,
              "CVSS Version": customer.default_cvss_version,
              "Default language": languageMapping[customer.language] || customer.language,
              buttons: (
                <Buttons noWrap>
                  <Button icon={mdiNoteEdit} small onClick={() => setIsModalCustomerActive(true)} />
                  <Button
                    className="trash-button"
                    icon={mdiTrashCan}
                    onClick={() => setIsModalTrashActive(true)}
                    small
                  />
                </Buttons>
              ),
            }))}
            perPageCustom={100}
          />
        )}
      </CardBox>
    </div>
  );
};

export default Customers;
