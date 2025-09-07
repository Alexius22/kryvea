import { mdiListBox, mdiNoteEdit, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData } from "../api/api";
import { getKryveaShadow } from "../api/cookie";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import PageHeader from "../components/Composition/PageHeader";
import Table from "../components/Composition/Table";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { Customer } from "../types/common.types";
import { languageMapping, USER_ROLE_ADMIN } from "../utils/constants";
import { getPageTitle } from "../utils/helpers";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [isModalCustomerActive, setIsModalCustomerActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    language: "en",
  });

  const {
    useCtxCustomer: [, setCtxCustomer],
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const languageOptions = Object.entries(languageMapping).map(([code, label]) => ({
    value: code,
    label,
  }));

  const selectedLanguageOption = languageOptions.find(opt => opt.value === formData.language);

  useEffect(() => {
    document.title = getPageTitle("Customers");
    fetchCustomers();
  }, []);

  function fetchCustomers() {
    setLoadingCustomers(true);
    getData<Customer[]>(
      "/api/customers",
      setCustomers,
      err => {
        const errorMessage = err.response.data.error;
        setError(errorMessage);
        toast.error(errorMessage);
      },
      () => setLoadingCustomers(false)
    );
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      language: customer.language,
    });
    setIsModalCustomerActive(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEditConfirm = () => {
    const payload = {
      name: formData.name,
      language: formData.language,
    };

    patchData<Customer>(`/api/admin/customers/${selectedCustomer.id}`, payload, updatedCustomer => {
      toast.success("Customer updated successfully");
      setIsModalCustomerActive(false);
      setCustomers(prev => prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
      fetchCustomers();
    });
  };

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalTrashActive(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedCustomer) return;

    deleteData<{ message: string }>(`/api/admin/customers/${selectedCustomer.id}`, () => {
      toast.success("Customer deleted successfully");
      setIsModalTrashActive(false);
      setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
      setCtxCustomer(undefined);
    });
  };

  const handleModalClose = () => {
    setIsModalCustomerActive(false);
    setIsModalTrashActive(false);
    setSelectedCustomer(null);
  };

  return (
    <div>
      {/* Edit Customer Modal */}
      {isModalCustomerActive && (
        <Modal
          title="Edit customer"
          confirmButtonLabel="Confirm"
          onConfirm={handleEditConfirm}
          onCancel={handleModalClose}
        >
          <Grid className="gap-4">
            <Input
              type="text"
              label="Company name"
              helperSubtitle="Required"
              placeholder="Company name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />

            <SelectWrapper
              label="Language"
              id="language"
              options={languageOptions}
              value={selectedLanguageOption}
              onChange={option => setFormData(prev => ({ ...prev, language: option.value }))}
            />
          </Grid>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isModalTrashActive && (
        <Modal
          title="Please confirm: action irreversible"
          confirmButtonLabel="Confirm"
          onConfirm={handleDeleteConfirm}
          onCancel={handleModalClose}
        >
          <p>
            Are you sure you want to delete customer <strong>{selectedCustomer?.name}</strong>?
          </p>
        </Modal>
      )}
      <PageHeader icon={mdiListBox} title="Customers">
        <Button icon={mdiPlus} text="New customer" small onClick={() => navigate("/customers/new")} />
      </PageHeader>

      <Table
        loading={loadingCustomers}
        data={customers.map(customer => ({
          Name: (
            <a
              className="cursor-pointer"
              onClick={() => {
                setCtxCustomer(customer);
                navigate(`${customer.id}/assessments`);
              }}
            >
              {customer.name}
            </a>
          ),
          "Default language": languageMapping[customer.language] || customer.language,
          buttons: (
            <Buttons noWrap>
              <Button
                title={
                  getKryveaShadow() !== USER_ROLE_ADMIN
                    ? "Only administrators can perform this action"
                    : "Edit customer"
                }
                disabled={getKryveaShadow() !== USER_ROLE_ADMIN}
                small
                onClick={() => openEditModal(customer)}
                icon={mdiNoteEdit}
              />
              <Button
                title={
                  getKryveaShadow() !== USER_ROLE_ADMIN
                    ? "Only administrators can perform this action"
                    : "Delete customer"
                }
                disabled={getKryveaShadow() !== USER_ROLE_ADMIN}
                small
                variant="danger"
                onClick={() => openDeleteModal(customer)}
                icon={mdiTrashCan}
              />
            </Buttons>
          ),
        }))}
        perPageCustom={100}
      />
    </div>
  );
}
