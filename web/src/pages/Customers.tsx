import { mdiEye, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GlobalContext } from "../../App";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import useFetch from "../hooks/useFetch";
import { customers } from "../mockup_data/customers";
import { Customer } from "../types/common.types";

const Customers = () => {
  const navigate = useNavigate();
  // const { data: customers, loading, error } = useFetch<Customer>(`/api/customers`);
  const loading = false;
  const error = false;

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
    <>
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
      <SectionMain>
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
        <CardBox hasTable>
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
                "Default language": customer.language,
                buttons: (
                  <td className="whitespace-nowrap before:hidden lg:w-1">
                    <Buttons type="justify-start lg:justify-end" noWrap>
                      <Button color="info" icon={mdiEye} small onClick={() => navigate("/customer")} />
                      <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                    </Buttons>
                  </td>
                ),
              }))}
              perPageCustom={100}
            />
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Customers;
