import { mdiListBox, mdiNoteEdit, mdiPlus, mdiTrashCan } from "@mdi/js";
import { Form, Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import useApi from "../hooks/useApi";
import { Customer } from "../types/common.types";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>();
  const [isModalCustomerActive, setIsModalCustomerActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const {
    useCustomerName: [_, setCustomerName],
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const { getData } = useApi();

  useEffect(() => {
    document.title = getPageTitle("Customers");
    getData<Customer[]>("/api/customers", setCustomers, err => console.error(err));
  }, []);

  const handleModalAction = () => {
    setIsModalCustomerActive(false);
    setIsModalTrashActive(false);
  };

  const loading = false;
  const error = false;
  const languageMapping: Record<string, string> = {
    en: "English",
    it: "Italian",
    fr: "French",
    de: "German",
    es: "Spanish",
  };

  return (
    <div>
      <Modal
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
      </Modal>

      <Modal
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
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title="Customers">
        <Button icon={mdiPlus} text="New customer" small onClick={() => navigate("/add_customer")} />
      </SectionTitleLineWithButton>
      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={customers?.map(customer => ({
              Name: (
                <Link to="" onClick={() => setCustomerName(customer.name)}>
                  {customer.name}
                </Link>
              ),
              "CVSS Version": customer.default_cvss_version,
              "Default language": languageMapping[customer.language] || customer.language,
              buttons: (
                <Buttons noWrap>
                  <Button small onClick={() => setIsModalCustomerActive(true)} icon={mdiNoteEdit} />
                  <Button small type="danger" onClick={() => setIsModalTrashActive(true)} icon={mdiTrashCan} />
                </Buttons>
              ),
            }))}
            perPageCustom={100}
          />
        )}
      </div>
    </div>
  );
}
