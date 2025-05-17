import { mdiEye, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GlobalContext } from "../../App";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
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

  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const {
    useCustomerName: [_, setCustomerName],
  } = useContext(GlobalContext);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Customers");
  }, []);

  return (
    <div>
      <CardBoxModal
        title="Please confirm"
        buttonColor="danger"
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
        <Button
          icon={mdiPlus}
          label="New customer"
          roundedFull
          small
          color="contrast"
          onClick={() => navigate("/add_customer")}
        />
      </SectionTitleLineWithButton>
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={customers.map(customer => ({
              Name: (
                <span
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  onClick={() => setCustomerName(customer.name)}
                >
                  {customer.name}
                </span>
              ),
              "CVSS Version": customer.default_cvss_version,
              "Default language": languageMapping[customer.language] || customer.language,
              buttons: (
                <Buttons noWrap>
                  <Button color="info" icon={mdiEye} small onClick={() => navigate("/customer")} />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
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
