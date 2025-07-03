import { mdiAccountEdit, mdiDownload, mdiListBox, mdiTarget, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { getData, patchData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Checkbox from "../components/Form/Checkbox";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import UploadFile from "../components/Form/UploadFile";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import Table from "../components/Table";
import { getPageTitle } from "../config";
import { Customer, TemplateExport } from "../types/common.types";
import { languageMapping } from "../types/languages";

export default function CustomerDetail() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [uploadedTemplates, setUploadedTemplates] = useState<File[]>([]);
  const [templateCustomer, setTemplateCustomer] = useState<TemplateExport>({
    template_name: "",
    template_file: null,
    template_type: null,
  });

  const [formCustomer, setFormCustomer] = useState({
    name: "",
    language: "en",
    default_cvss_versions: [] as string[],
  });

  const {
    useCtxCustomer: [ctxCustomer, setCtxCustomer],
  } = useContext(GlobalContext);

  const navigate = useNavigate();

  const languageOptions = Object.entries(languageMapping).map(([code, label]) => ({
    value: code,
    label,
  }));

  const cvssOptions = [
    { value: "4.0", label: "4.0" },
    { value: "3.1", label: "3.1" },
  ];

  const templateTypeOptions = [
    { value: "docx", label: "Word Document (docx)" },
    { value: "xlsx", label: "Excel Spreadsheet (xlsx)" },
  ];

  const selectedTemplateTypeOption =
    templateTypeOptions.find(opt => opt.value === templateCustomer.template_type) || null;

  const selectedLanguageOption = languageOptions.find(opt => opt.value === formCustomer.language);

  useEffect(() => {
    document.title = getPageTitle("Customer detail");
    getData<Customer>(
      `/api/customers/${ctxCustomer.id}`,
      data => {
        setCustomer(data);
        setFormCustomer({
          name: data.name,
          language: data.language,
          default_cvss_versions: data.default_cvss_versions || [],
        });
      },
      err => {
        const errorMessage = err?.response?.data?.error;
        toast.error(errorMessage);
      }
    );
    const mockFile1 = new File(
      [
        new Blob(["Mock Word document content"], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
      ],
      "mock-template1.docx",
      { type: "docx" }
    );

    const mockFile2 = new File(
      [
        new Blob(["Mock Excel spreadsheet content"], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      ],
      "mock-template2.xlsx",
      { type: "xlsx" }
    );
    setUploadedTemplates([mockFile1, mockFile2]);
  }, [ctxCustomer?.id]);

  const toggleCvssVersion = (version: string) => {
    setFormCustomer(prev => {
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

  const handleCustomerName = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    if (id === "template_name" || id === "template_type") {
      setTemplateCustomer(prev => ({
        ...prev,
        [id]: id === "template_type" ? (value as "docx" | "xlsx") : value,
      }));
    } else {
      setFormCustomer(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = () => {
    if (!formCustomer.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    const payload = {
      name: formCustomer.name,
      language: formCustomer.language,
      default_cvss_versions: formCustomer.default_cvss_versions,
    };

    patchData<Customer>(
      `/api/customers/${ctxCustomer.id}`,
      payload,
      updatedCustomer => {
        toast.success("Customer updated successfully");
        setCustomer(updatedCustomer);
        setCtxCustomer(updatedCustomer);
      },
      err => {
        const errorMessage = err?.response?.data?.error;
        toast.error(errorMessage);
      }
    );
  };

  const changeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    setUploadedTemplates(prev => [...prev, files[0]]);
    setFileObj(null);
  };

  const clearFile = () => {
    setFileObj(null);
    setTemplateCustomer(prev => ({ ...prev, template_file: null }));
  };

  const downloadUploadedTemplate = (index: number) => {
    const file = uploadedTemplates[index];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deleteUploadedTemplate = (index: number) => {
    setUploadedTemplates(prev => prev.filter((_, i) => i !== index));
  };

  const deleteTemplateFile = () => {
    setFileObj(null);
  };

  const handleUploadTemplate = () => {
    if (!templateCustomer.template_name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!templateCustomer.template_type) {
      toast.error("Template type is required");
      return;
    }
    if (!templateCustomer.template_file) {
      toast.error("Please select a template file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("template_name", templateCustomer.template_name);
    formData.append("template_type", templateCustomer.template_type);
    formData.append("template_file", templateCustomer.template_file);

    postData(
      `/api/customers/${ctxCustomer.id}/templates`,
      formData,
      response => {
        toast.success("Template uploaded successfully");
        setTemplateCustomer({
          template_name: "",
          template_file: null,
          template_type: null,
        });
        setFileObj(null);
      },
      err => {
        const errorMessage = err?.response?.data?.error;
        toast.error(errorMessage);
      }
    );
  };

  // Dynamically set accept attribute based on template type
  const fileAccept =
    templateCustomer.template_type === "xlsx"
      ? ".xlsx"
      : templateCustomer.template_type === "docx"
        ? ".docx"
        : ".docx,.xlsx";

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiAccountEdit} title={`Customer: ${ctxCustomer.name}`}>
        <Buttons>
          <Button
            text="Assessments"
            icon={mdiListBox}
            onClick={() => navigate(`/customers/${ctxCustomer.id}/assessments`)}
          />
          <Button text="Targets" icon={mdiTarget} onClick={() => navigate(`/customers/${ctxCustomer.id}/targets`)} />
        </Buttons>
      </SectionTitleLineWithButton>
      <div className="grid grid-cols-2 gap-4">
        <Card className="w-full">
          <h2 className="text-2xl">General</h2>
          <Grid className="gap-4">
            <Input
              type="text"
              label="Company name"
              helperSubtitle="Required"
              placeholder="Company name"
              id="name"
              value={formCustomer.name}
              onChange={handleCustomerName}
            />

            <SelectWrapper
              label="Language"
              id="language"
              options={languageOptions}
              value={selectedLanguageOption}
              onChange={option => setFormCustomer(prev => ({ ...prev, language: option.value }))}
            />

            <Grid>
              <Label text="CVSS Versions" />
              {cvssOptions.map(({ value, label }) => (
                <Checkbox
                  key={value}
                  id={`cvss_${value}`}
                  htmlFor={`cvss_${value}`}
                  label={label}
                  checked={formCustomer.default_cvss_versions.includes(value)}
                  onChange={() => toggleCvssVersion(value)}
                />
              ))}
            </Grid>
          </Grid>
          <Divider />
          <Buttons>
            <Button text="Submit" onClick={handleSubmit} />
            <Button type="secondary" text="Cancel" onClick={() => navigate("/customers")} />
          </Buttons>
        </Card>
        <Card className="w-full">
          <h2 className="text-2xl">Template</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                label="Name"
                placeholder="Template name"
                id="template_name"
                value={templateCustomer.template_name}
                onChange={handleCustomerName}
              />
              <SelectWrapper
                label="Type"
                id="template_type"
                options={templateTypeOptions}
                value={selectedTemplateTypeOption}
                onChange={option => setTemplateCustomer(prev => ({ ...prev, template_type: option.value }))}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label text={"Upload a new template file"} />
            <UploadFile
              inputId={"template_file"}
              filename={fileObj?.name}
              name={"template_file"}
              accept=".docx,.xlsx"
              onChange={changeFile}
              onButtonClick={clearFile}
            />
          </div>
          <Divider />
          <Buttons>
            <Button text="Upload" onClick={handleUploadTemplate} />
          </Buttons>
        </Card>
        {uploadedTemplates && (
          <Table
            data={uploadedTemplates.map((file, index) => ({
              Name: file.name,
              Type: file.type,
              buttons: (
                <Buttons noWrap>
                  <Button icon={mdiDownload} onClick={() => downloadUploadedTemplate(index)} type="secondary" />
                  <Button icon={mdiTrashCan} onClick={() => deleteUploadedTemplate(index)} type="danger" />
                </Buttons>
              ),
            }))}
            perPageCustom={5}
          />
        )}
      </div>
    </div>
  );
}
