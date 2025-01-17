import { mdiEye, mdiListBox, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";

const Users = () => {
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Users");
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
        <p>Are you sure to delete this user?</p>
        <p>
          <b>Action irreversible</b>
        </p>
      </CardBoxModal>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiListBox} title="Users" />
        <CardBox hasTable>
          <Table
            data={Array(21)
              .fill(0)
              .map((el, i) => ({
                Username: i + 1,
                Role: i + 1,
                Customers: i + 1,
                Active: i + 1,
              }))}
            buttons={
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button color="info" icon={mdiEye} onClick={() => setIsModalInfoActive(true)} small href="/user" />
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              </td>
            }
            perPageCustom={100}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Users;
