import { mdiListBox, mdiPencil, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData } from "../api/api";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Target } from "../types/common.types";

export default function Targets() {
  const [targets, setTargets] = useState<Target[]>([]);

  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<Target | null>(null);

  const [isModalEditActive, setIsModalEditActive] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);

  const [ipv4, setIpv4] = useState("");
  const [ipv6, setIpv6] = useState("");
  const [fqdn, setFqdn] = useState("");
  const [hostName, setHostName] = useState("");

  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();

  const fetchTargets = () => {
    getData<Target[]>(`/api/customers/${customerId}/targets`, setTargets);
  };

  useEffect(() => {
    document.title = getPageTitle("Targets");
    fetchTargets();
  }, [customerId]);

  const openEditModal = (target: Target) => {
    setEditingTarget(target);
    setIpv4(target.ipv4 || "");
    setIpv6(target.ipv6 || "");
    setFqdn(target.fqdn || "");
    setHostName(target.name || "");
    setIsModalEditActive(true);
  };

  const handleEditConfirm = () => {
    const payload = {
      ipv4: ipv4.trim(),
      ipv6: ipv6.trim(),
      fqdn: fqdn.trim(),
      name: hostName.trim(),
    };

    patchData<Target>(`/api/customers/${customerId}/targets/${editingTarget.id}`, payload, () => {
      toast.success("Target updated successfully");
      setIsModalEditActive(false);
      setEditingTarget(null);
      fetchTargets();
    });
  };

  const openDeleteModal = (target: Target) => {
    setTargetToDelete(target);
    setIsModalTrashActive(true);
  };

  const handleDeleteConfirm = () => {
    deleteData(`/api/customers/${customerId}/targets/${targetToDelete.id}`, () => {
      toast.success(
        `Target "${targetToDelete.name || targetToDelete.fqdn || targetToDelete.ipv4 || targetToDelete.ipv6}" deleted successfully`
      );
      setIsModalTrashActive(false);
      setTargetToDelete(null);
      fetchTargets();
    });
  };

  return (
    <div>
      {/* Edit Target Modal */}
      <Modal
        title="Edit Target"
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
          <strong>
            {targetToDelete?.name || targetToDelete?.fqdn || targetToDelete?.ipv4 || targetToDelete?.ipv6 || ""}
          </strong>{" "}
          target?
        </p>
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title="Targets">
        <Button
          icon={mdiPlus}
          text="New target"
          small
          onClick={() => navigate(`/customers/${customerId}/targets/add_target`)}
        />
      </SectionTitleLineWithButton>

      <Table
        data={targets.map(target => ({
          FQDN: target.fqdn,
          IPv4: target.ipv4,
          IPv6: target.ipv6,
          Name: target.name,
          buttons: (
            <Buttons noWrap>
              <Button icon={mdiPencil} onClick={() => openEditModal(target)} small />
              <Button type="danger" icon={mdiTrashCan} onClick={() => openDeleteModal(target)} small />
            </Buttons>
          ),
        }))}
        perPageCustom={10}
      />
    </div>
  );
}
