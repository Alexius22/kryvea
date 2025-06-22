import { mdiListBox, mdiNoteEdit, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import { deleteData, getData, patchData } from "../api/api";
import { GlobalContext } from "../App";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Customer } from "../types/common.types";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isModalCustomerActive, setIsModalCustomerActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    language: "en",
    default_cvss_versions: [],
  });

  const {
    useCustomerName: [, setCustomerName],
    useCustomerId: [, setCustomerId],
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const languageMapping: Record<string, string> = {
    bg: "Bulgarian",
    cs: "Czech",
    da: "Danish",
    de: "German",
    el: "Greek",
    en: "English",
    es: "Spanish",
    et: "Estonian",
    fi: "Finnish",
    fr: "French",
    hr: "Croatian",
    hu: "Hungarian",
    is: "Icelandic",
    it: "Italian",
    lt: "Lithuanian",
    lv: "Latvian",
    nl: "Dutch",
    pl: "Polish",
    pt: "Portuguese",
    ro: "Romanian",
    ru: "Russian",
    sk: "Slovak",
    sl: "Slovenian",
    sv: "Swedish",
  };

  const languageOptions = Object.entries(languageMapping).map(([code, label]) => ({
    value: code,
    label,
  }));

  const cvssOptions = [
    { value: "4.0", label: "4.0" },
    { value: "3.1", label: "3.1" },
  ];

  const selectedLanguageOption = languageOptions.find(opt => opt.value === formData.language);

  useEffect(() => {
    document.title = getPageTitle("Customers");
    fetchCustomers();
  }, []);

  function fetchCustomers() {
    getData<Customer[]>("/api/customers", setCustomers, err => {
      const errorMessage = err.response.data.error;
      setError(errorMessage);
      toast.error(errorMessage);
    });
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      language: customer.language,
      default_cvss_versions: customer.default_cvss_versions,
    });
    setIsModalCustomerActive(true);
  };

  const toggleCvssVersion = (version: string) => {
    setFormData(prev => {
      const current = prev.default_cvss_versions;
      if (current.includes(version)) {
        return {
          ...prev,
          default_cvss_versions: current.filter(v => v !== version),
        };
      } else {
        return {
          ...prev,
          default_cvss_versions: [...current, version],
        };
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleEditConfirm = () => {
    const payload = {
      name: formData.name,
      language: formData.language,
      default_cvss_versions: formData.default_cvss_versions,
    };

    patchData<Customer>(
      `/api/customers/${selectedCustomer.id}`,
      payload,
      updatedCustomer => {
        toast.success("Customer updated successfully");
        setIsModalCustomerActive(false);
        setCustomers(prev => prev.map(c => (c.id === updatedCustomer.id ? updatedCustomer : c)));
        fetchCustomers();
      },
      err => {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
      }
    );
  };

  const openDeleteModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalTrashActive(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedCustomer) return;

    deleteData<{ message: string }>(
      `/api/customers/${selectedCustomer.id}`,
      () => {
        toast.success("Customer deleted successfully");
        setIsModalTrashActive(false);
        setCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));
      },
      err => {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
      }
    );
  };

  const handleModalClose = () => {
    setIsModalCustomerActive(false);
    setIsModalTrashActive(false);
    setSelectedCustomer(null);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCustomerName(customer.name);
    setCustomerId(customer.id);
  };

  return (
    <div>
      {/* Edit Customer Modal */}
      <Modal
        title="Edit customer"
        buttonLabel="Confirm"
        isActive={isModalCustomerActive}
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

          <Grid>
            <Label text="CVSS Versions" />
            {cvssOptions.map(({ value, label }) => (
              <Checkbox
                key={value}
                id={`cvss_${value}`}
                htmlFor={`cvss_${value}`}
                label={label}
                checked={formData.default_cvss_versions.includes(value)}
                onChange={() => toggleCvssVersion(value)}
              />
            ))}
          </Grid>
        </Grid>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Please confirm: action irreversible"
        buttonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleDeleteConfirm}
        onCancel={handleModalClose}
      >
        <p>
          Are you sure you want to delete customer <strong>{selectedCustomer?.name}</strong>?
        </p>
      </Modal>

      <SectionTitleLineWithButton icon={mdiListBox} title="Customers">
        <Button icon={mdiPlus} text="New customer" small onClick={() => navigate("/add_customer")} />
      </SectionTitleLineWithButton>

      <Table
        data={customers.map(customer => ({
          Name: (
            <Link
              to="#"
              onClick={e => {
                e.preventDefault();
                handleCustomerSelect(customer);
              }}
            >
              {customer.name}
            </Link>
          ),
          "CVSS Versions": Array.isArray(customer.default_cvss_versions)
            ? customer.default_cvss_versions.join(" | ")
            : customer.default_cvss_versions,
          "Default language": languageMapping[customer.language] || customer.language,
          buttons: (
            <Buttons noWrap>
              <Button small onClick={() => openEditModal(customer)} icon={mdiNoteEdit} />
              <Button small type="danger" onClick={() => openDeleteModal(customer)} icon={mdiTrashCan} />
            </Buttons>
          ),
        }))}
        perPageCustom={100}
      />
    </div>
  );
}
