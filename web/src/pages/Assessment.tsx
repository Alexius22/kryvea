import { mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";

const Assessment = () => {
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalTrashActive(false);
  };
  useEffect(() => {
    document.title = getPageTitle("Customer");
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
        <SectionTitleLineWithButton icon={mdiListBox} title="Assessment">
          <Buttons>
            <Button icon={mdiPlus} label="New host" roundedFull small color="contrast" href="/add_host" />
            <Button
              icon={mdiPlus}
              label="New vulnerability"
              roundedFull
              small
              color="contrast"
              href="/add_vulnerability"
            />
          </Buttons>
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          <Table
            data={Array(21)
              .fill(0)
              .map((el, i) => ({
                Vulnerability: i + 1,
                Host: i + 1,
                "CVSS Score": i + 1,
              }))}
            buttons={
              <td className="whitespace-nowrap before:hidden lg:w-1">
                <Buttons type="justify-start lg:justify-end" noWrap>
                  <Button color="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              </td>
            }
            perPageCustom={10}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Assessment;
