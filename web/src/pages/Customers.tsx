import { mdiListBox, mdiNoteEdit, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Form, Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GlobalContext } from "../App";
import Buttons from "../components/Form/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/CardBoxModal";
import Grid from "../components/Composition/Grid";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { customers } from "../mockup_data/customers";
import Button from "../components/Form/Button";

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
            <Grid className="gap-4">
              <Input
                type="text"
                label="Company Name"
                helperSubtitle="Required"
                placeholder="CompanyName"
                id="companyName"
              />

              <SelectWrapper
                label="Language"
                id="language"
                options={[
                  { value: "italian", label: "Italian" },
                  { value: "english", label: "English" },
                  { value: "spanish", label: "Spanish" },
                  { value: "french", label: "French" },
                  { value: "german", label: "German" },
                ]}
                onChange={option => console.log("Selected language:", option.value)}
              />

              <SelectWrapper
                label="Default CVSS Version"
                id="cvss"
                options={[
                  { value: "4", label: "4" },
                  { value: "3.1", label: "3.1" },
                  { value: "2", label: "2" },
                ]}
                onChange={option => console.log("Selected CVSS version:", option.value)}
              />
            </Grid>
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
        {/* <Button icon={mdiPlus} label="New customer" roundedFull small onClick={() => navigate("/add_customer")} /> */}
      </SectionTitleLineWithButton>
      <CardBox className="!p-0">
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
                  <Button small onClick={() => setIsModalCustomerActive(true)} icon={mdiNoteEdit} />
                  <Button type="danger" small onClick={() => setIsModalTrashActive(true)} icon={mdiTrashCan} />
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
