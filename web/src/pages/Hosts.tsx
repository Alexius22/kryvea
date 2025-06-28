import { mdiListBox, mdiPencil, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";
import { deleteData, getData, patchData } from "../api/api";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Host } from "../types/common.types";

export default function Hosts() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();

  const [hosts, setHosts] = useState<Host[]>([]);

  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [hostToDelete, setHostToDelete] = useState<Host | null>(null);

  const [isModalEditActive, setIsModalEditActive] = useState(false);
  const [editingHost, setEditingHost] = useState<Host | null>(null);

  const [ipv4, setIpv4] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [hostName, setHostName] = useState("");

  const fetchHosts = () => {
    getData<Host[]>(
      `/api/customers/${customerId}/targets`,
      data => {
        setHosts(data);
      },
      err => {
        toast.error(err.response.data.error);
      }
    );
  };

  useEffect(() => {
    document.title = getPageTitle("Hosts");
    fetchHosts();
  }, [customerId]);

  const openEditModal = (host: Host) => {
    setEditingHost(host);
    setIpv4(host.ipv4 || "");
    setIpv6(host.ipv6 || "");
    setFqdn(host.fqdn || "");
    setHostName(host.name || "");
    setIsModalEditActive(true);
  };

  const handleEditConfirm = () => {
    const payload = {
      ipv4: ipv4.trim(),
      ipv6: ipv6.trim(),
      fqdn: fqdn.trim(),
      name: hostName.trim(),
    };

    patchData<Host>(
      `/api/customers/${customerId}/targets/${editingHost.id}`,
      payload,
      () => {
        toast.success("Host updated successfully");
        setIsModalEditActive(false);
        setEditingHost(null);
        fetchHosts();
      },
      err => {
        toast.error(err.response.data.error);
      }
    );
  };

  const openDeleteModal = (target: Host) => {
    setHostToDelete(target);
    setIsModalTrashActive(true);
  };

  const handleDeleteConfirm = () => {
    deleteData(
      `/api/customers/${customerId}/targets/${hostToDelete.id}`,
      () => {
        toast.success(
          `Host "${hostToDelete.name || hostToDelete.fqdn || hostToDelete.ipv4 || hostToDelete.ipv6}" deleted successfully`
        );
        setIsModalTrashActive(false);
        setHostToDelete(null);
        fetchHosts();
      },
      err => {
        toast.error(err.response.data.error);
      }
    );
  };

  return (
    <div>
      {/* Edit Host Modal */}
      <Modal
        title="Edit Host"
        buttonLabel="Save"
        isActive={isModalEditActive}
        onConfirm={handleEditConfirm}
        onCancel={() => setIsModalEditActive(false)}
      >
        <Grid className="grid-cols-1 gap-4">
          <Input
            type="text"
            id="ipv4"
            label="IPv4"
            placeholder="IPv4 address"
            value={ipv4}
            onChange={e => setIpv4(e.target.value)}
          />
          <Input
            type="text"
            id="ipv6"
            label="IPv6"
            placeholder="IPv6 address"
            value={ipv6}
            onChange={e => setIpv6(e.target.value)}
          />
          <Input
            type="text"
            id="fqdn"
            label="FQDN"
            placeholder="Fully Qualified Domain Name"
            value={fqdn}
            onChange={e => setFqdn(e.target.value)}
          />
          <Input
            type="text"
            id="name"
            label="Name"
            placeholder="This name is used to differentiate between duplicate entries"
            value={hostName}
            onChange={e => setHostName(e.target.value)}
          />
        </Grid>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsModalTrashActive(false)}
      >
        <p>
          Are you sure to delete{" "}
          <strong>{hostToDelete?.name || hostToDelete?.fqdn || hostToDelete?.ipv4 || hostToDelete?.ipv6 || ""}</strong>{" "}
          host?
        </p>
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title="Hosts">
        <Button
          icon={mdiPlus}
          text="New host"
          small
          onClick={() => navigate(`/customers/${customerId}/targets/add_host`)}
        />
      </SectionTitleLineWithButton>

      <Table
        data={hosts.map(host => ({
          FQDN: host.fqdn,
          IPv4: host.ipv4,
          IPv6: host.ipv6,
          Name: host.name,
          buttons: (
            <Buttons noWrap>
              <Button icon={mdiPencil} onClick={() => openEditModal(host)} small />
              <Button type="danger" icon={mdiTrashCan} onClick={() => openDeleteModal(host)} small />
            </Buttons>
          ),
        }))}
        perPageCustom={10}
      />
    </div>
  );
}
