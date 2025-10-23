import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { postData } from "../api/api";
import Card from "../components/Composition/Card";
import Divider from "../components/Composition/Divider";
import Grid from "../components/Composition/Grid";
import PageHeader from "../components/Composition/PageHeader";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import UploadImage from "../components/Form/UploadImage";
import { Customer } from "../types/common.types";
import { languageMapping } from "../utils/constants";
import { getPageTitle } from "../utils/helpers";

export default function AddCustomer() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [language, setLanguage] = useState("en");
  const [imageFile, setImageFile] = useState<File | null>(null);

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

    const formData = new FormData();
    if (imageFile) {
      formData.append("file", imageFile, imageFile.name);
    }
    formData.append("data", JSON.stringify(payload));

    postData<Customer>("/api/admin/customers", formData, () => {
      toast.success(`Customer "${payload.name}" added successfully`);
      navigate("/customers");
    });
  };

  const handleCancel = () => {
    navigate("/customers");
  };

  return (
    <div>
      <PageHeader title="New customer" />
      <Card>
        <Grid className="gap-4">
          <Grid className="grid-cols-2 !items-start">
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
              label="Default language"
              id="language"
              options={languageOptions}
              value={languageOptions.find(opt => opt.value === language) || null}
              onChange={option => setLanguage(option.value)}
            />
            <UploadImage label="Upload logo" onChange={file => setImageFile(file)} previewHeight={200} />
          </Grid>
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
