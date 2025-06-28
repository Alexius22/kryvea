import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getData, postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { getPageTitle } from "../config";
import { Customer } from "../types/common.types";

export default function AddUser() {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.title = getPageTitle("User");

    getData<Customer[]>(
      "/api/customers",
      data => setCustomers(data),
      err => {
        const errorMessage = err.response.data.error;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    );
  }, []);

  // Prepare options for the customers select dropdown
  const customerOptions = customers.map(customer => ({
    label: customer.name,
    value: customer.id,
  }));
  const selectAllOption = { value: "all", label: "Select All" };

  // Handle changes in the customers multi-select
  const handleSelectChange = (selectedOptions: { value: string; label: string }[] | null) => {
    if (!selectedOptions) {
      setSelectedCustomers([]);
      return;
    }

    // If "Select All" is chosen, select all customer IDs
    if (selectedOptions.some(option => option.value === "all")) {
      setSelectedCustomers(customers.map(c => c.id));
    } else {
      setSelectedCustomers(selectedOptions.map(option => option.value));
    }
  };

  const handleSubmit = () => {
    postData(
      "/api/users",
      {
        username,
        role,
        customers: selectedCustomers,
      },
      () => navigate("/users"),
      err => {
        const errorMessage = err.response.data.error;
        setError(errorMessage);
        toast.error(errorMessage);
      }
    );
  };

  return (
    <Card>
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
          onChange={option => setRole(option.value)}
          value={role ? { value: role, label: role.charAt(0).toUpperCase() + role.slice(1) } : null}
        />
        <SelectWrapper
          label="Customers"
          options={[selectAllOption, ...customerOptions]}
          isMulti
          value={customerOptions.filter(option => selectedCustomers.includes(option.value))}
          onChange={handleSelectChange}
          closeMenuOnSelect={false}
          id="customer-selection"
        />
        <Divider />
        <Buttons>
          <Button text="Submit" onClick={handleSubmit} />
          <Button type="outline-only" text="Cancel" onClick={() => navigate("/users")} />
        </Buttons>
      </Grid>
    </Card>
  );
}
