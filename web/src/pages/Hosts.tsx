import { mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionMain from "../components/Section/Main";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import useFetch from "../hooks/useFetch";
import { targets } from "../mockup_data/targets";
import { Host } from "../types/common.types";

const Hosts = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  //const { data: targets, loading, error } = useFetch<Host[]>(`/api/targets/${id}`);
  const loading = false;
  const error = false;

  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const handleModalAction = () => {
    setIsModalTrashActive(false);
  };
  useEffect(() => {
    document.title = getPageTitle("Hosts");
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
        <SectionTitleLineWithButton icon={mdiListBox} title="Hosts">
          <Buttons>
            <Button
              icon={mdiPlus}
              label="New host"
              roundedFull
              small
              color="contrast"
              onClick={() => navigate("/add_host")}
            />
          </Buttons>
        </SectionTitleLineWithButton>
        <CardBox hasTable>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <Table
              data={targets.map(target => ({
                IP: target.ip,
                Hostname: target.hostname,
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
          )}
        </CardBox>
      </SectionMain>
    </>
  );
};

export default Hosts;
