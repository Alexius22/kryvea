import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import { getPageTitle } from "../config";
import { Customer } from "../types/common.types";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [language, setLanguage] = useState("en");
  const [selectedCvssVersions, setSelectedCvssVersions] = useState<string[]>([]);

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

  const languageOptions: SelectOption[] = Object.entries(languageMapping).map(([code, label]) => ({
    value: code,
    label,
  }));

  const cvssOptions: SelectOption[] = [
    { value: "3.1", label: "3.1" },
    { value: "4.0", label: "4.0" },
  ];

  useEffect(() => {
    document.title = getPageTitle("Add Customer");
  }, []);

  const toggleCvssVersion = (version: string) => {
    setSelectedCvssVersions(prev => (prev.includes(version) ? prev.filter(v => v !== version) : [...prev, version]));
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (selectedCvssVersions.length === 0) {
      toast.error("Please select at least one CVSS version");
      return;
    }

    const payload = {
      name: companyName.trim(),
      language,
      default_cvss_versions: selectedCvssVersions,
    };

    postData<Customer>(
      "/api/customers",
      payload,
      () => {
        toast.success(`Customer "${payload.name}" added successfully`);
        navigate("/customers");
      },
      err => {
        const errorMessage = err.response.data.error;
        toast.error(errorMessage);
      }
    );
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

          <Grid>
            <Label text="CVSS Versions" />
            {cvssOptions.map(({ value, label }) => (
              <Checkbox
                key={value}
                id={`cvss_${value.replace(".", "")}`}
                htmlFor={`cvss_${value.replace(".", "")}`}
                label={label}
                checked={selectedCvssVersions.includes(value)}
                onChange={() => toggleCvssVersion(value)}
              />
            ))}
          </Grid>

          <Divider />

          <Buttons>
            <Button text="Submit" onClick={handleSubmit} />
            <Button type="secondary" text="Cancel" onClick={handleCancel} />
          </Buttons>
        </Grid>
      </Card>
    </div>
  );
}
