import { mdiAccountEdit, mdiListBox, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData } from "../api/api";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Customer, User } from "../types/common.types";

export default function Users() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [userDisabled, setUserDisabled] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    document.title = getPageTitle("Users");

    getData<User[]>("/api/users", setUsers, err => {
      const errorMessage = err.response.data.error;
      setError(errorMessage);
      toast.error(errorMessage);
    });

    getData<Customer[]>("/api/customers", setCustomers, err => {
      const errorMessage = err.response.data.error;
      setError(errorMessage);
      toast.error(errorMessage);
    });
  }, []);

  // Prepare customer options for SelectWrapper
  const customerOptions = customers.map(customer => ({
    label: customer.name,
    value: customer.id,
  }));

  // Handle changes in the customers multi-select
  const handleSelectChange = (selectedOptions: { value: string; label: string }[] | null) => {
    if (!selectedOptions) {
      setSelectedCustomers([]);
      return;
    }

    if (selectedOptions.some(option => option.value === "all")) {
      setSelectedCustomers(customers.map(c => c.id));
    } else {
      setSelectedCustomers(selectedOptions.map(option => option.value));
    }
  };

  // Open edit modal and populate form with user data
  const openEditModal = (user: User) => {
    setActiveUserId(user.id);
    setUsername(user.username);
    setRole(user.role);
    setSelectedCustomers(user.customers.map(c => c.id));
    setUserDisabled(user.disabled_at);
    setIsModalInfoActive(true);
  };

  const openDeleteModal = (userId: string) => {
    setActiveUserId(userId);
    setIsModalTrashActive(true);
  };

  const handleModalAction = () => {
    setIsModalInfoActive(false);
    setIsModalTrashActive(false);
    setActiveUserId(null);
  };

  const handleUpdateUser = () => {
    if (!activeUserId) return;

    const payload = {
      username,
      role,
      customers: selectedCustomers,
      disabled_at: userDisabled,
    };

    patchData<User>(`/api/users/${activeUserId}`, payload, updatedUser => {
      toast.success(`User ${payload.username} updated successfully`);
      setIsModalInfoActive(false);
      setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
    });
  };

  const handleDeleteUser = () => {
    if (!activeUserId) return;

    deleteData<{ message: string }>(`/api/users/${activeUserId}`, () => {
      toast.success("User deleted successfully");
      setIsModalTrashActive(false);
      setUsers(prev => prev.filter(u => u.id !== activeUserId));
    });
  };

  return (
    <div>
      {/* Edit User Modal */}
      <Modal
        title="Edit user"
        buttonLabel="Confirm"
        isActive={isModalInfoActive}
        onConfirm={handleUpdateUser}
        onCancel={handleModalAction}
      >
        <Grid className="gap-4">
          <Input
            type="text"
            label="Username"
            placeholder="username"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <SelectWrapper
            label="Role"
            id="role-selection"
            options={[
              { value: "admin", label: "Admin" },
              { value: "user", label: "User" },
            ]}
            closeMenuOnSelect
            onChange={option => setRole(option?.value || "")}
            value={role ? { value: role, label: role.charAt(0).toUpperCase() + role.slice(1) } : null}
          />
          <SelectWrapper
            label="Customers"
            options={customerOptions}
            isMulti
            value={customerOptions.filter(option => selectedCustomers.includes(option.value))}
            onChange={handleSelectChange}
            closeMenuOnSelect={false}
            id="customer-selection"
          />
          <Input
            type="datetime-local"
            id="disable_user_at"
            label="Disable user from"
            value={userDisabled ? userDisabled.substring(0, 16) : ""}
            onChange={e => {
              setUserDisabled(new Date(e.target.value).toISOString());
            }}
          />
        </Grid>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleDeleteUser}
        onCancel={handleModalAction}
      >
        <p>Are you sure you want to delete this user?</p>
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title="Users">
        <Button icon={mdiPlus} text="New user" small onClick={() => navigate("/add_user")} />
      </SectionTitleLineWithButton>

      {/* Users Table */}
      <Table
        data={users.map(user => ({
          Username: user.username,
          Role: user.role,
          Customers: user.customers.map(customer => customer.name).join(" | "),
          Active: Date.parse(user.disabled_at) > Date.now() ? "Yes" : "No",
          buttons: (
            <Buttons noWrap key={user.id}>
              <Button icon={mdiAccountEdit} onClick={() => openEditModal(user)} small />
              <Button type="danger" icon={mdiTrashCan} onClick={() => openDeleteModal(user.id)} small />
            </Buttons>
          ),
        }))}
        perPageCustom={50}
        maxWidthColumns={{ Customers: "20rem" }}
      />
    </div>
  );
}
