import { mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table/Table";
import { getPageTitle } from "../config";
import { targets } from "../mockup_data/targets";

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
    <div>
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

      <SectionTitleLineWithButton icon={mdiListBox} title="Hosts">
        <Buttons>
          <Button icon={mdiPlus} label="New host" roundedFull small onClick={() => navigate("/add_host")} />
        </Buttons>
      </SectionTitleLineWithButton>
      <CardBox noPadding>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <Table
            data={targets.map(target => ({
              IP: target.ip,
              Hostname: target.hostname,
              buttons: (
                <Buttons noWrap>
                  <Button icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={10}
          />
        )}
      </CardBox>
    </div>
  );
};

export default Hosts;
