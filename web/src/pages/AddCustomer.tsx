import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import { getPageTitle } from "../config";
import { Customer } from "../types/common.types";
import { languageMapping } from "../types/languages";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [language, setLanguage] = useState("en");

  const languageOptions: SelectOption[] = Object.entries(languageMapping).map(([code, label]) => ({
    value: code,
    label,
  }));

  useEffect(() => {
    document.title = getPageTitle("New Customer");
  }, []);

  const handleSubmit = () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    const payload = {
      name: companyName.trim(),
      language,
    };

    postData<Customer>("/api/admin/customers", payload, () => {
      toast.success(`Customer "${payload.name}" added successfully`);
      navigate("/customers");
    });
  };

  const handleCancel = () => {
    navigate("/customers");
  };

  return (
    <div>
      <Card>
        <Grid className="gap-4">
          <Input
            type="text"
            label="Company name"
            helperSubtitle="Required"
            placeholder="Company name"
            id="companyName"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
          />

          <SelectWrapper
            label="Language"
            id="language"
            options={languageOptions}
            value={languageOptions.find(opt => opt.value === language) || null}
            onChange={option => setLanguage(option.value)}
          />

          <Divider />

          <Buttons>
            <Button text="Submit" onClick={handleSubmit} />
            <Button variant="secondary" text="Cancel" onClick={handleCancel} />
          </Buttons>
        </Grid>
      </Card>
    </div>
  );
}
