import { mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Card from "../components/CardBox/Card";
import CardBoxModal from "../components/CardBox/CardBoxModal";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import Table from "../components/Table";
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
        <Button icon={mdiPlus} text="New host" small onClick={() => navigate("/add_host")} />
      </SectionTitleLineWithButton>
      <Card className="!p-0">
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
                  <Button type="danger" icon={mdiTrashCan} onClick={() => setIsModalTrashActive(true)} small />
                </Buttons>
              ),
            }))}
            perPageCustom={10}
          />
        )}
      </Card>
    </div>
  );
};

export default Hosts;
