import { mdiAccountEdit, mdiDownload, mdiListBox, mdiTarget, mdiTrashCan } from "@mdi/js";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData, postData } from "../api/api";
import { GlobalContext } from "../App";
import Card from "../components/CardBox/Card";
import CardTitle from "../components/CardBox/CardTitle";
import Grid from "../components/Composition/Grid";
import Table from "../components/Composition/Table";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import UploadFile from "../components/Form/UploadFile";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";
import { Customer, Template } from "../types/common.types";
import { languageMapping } from "../types/languages";

export default function CustomerDetail() {
  const {
    useCtxCustomer: [ctxCustomer, setCtxCustomer],
  } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [fileObj, setFileObj] = useState<File | null>(null);
  const [customerTemplates, setCustomerTemplates] = useState<Template[]>([]);

  const [formCustomer, setFormCustomer] = useState({
    name: ctxCustomer?.name || "",
    language: ctxCustomer?.language || "",
  });

  const [newTemplateData, setNewTemplateData] = useState({
    name: "",
    type: "",
    file: null as File | null,
  });

  const languageOptions = Object.entries(languageMapping).map(([code, label]) => ({
    value: code,
    label,
  }));

  const selectedLanguageOption = languageOptions.find(opt => opt.value === formCustomer.language);

  useEffect(() => {
    document.title = getPageTitle("Customer detail");
    if (ctxCustomer?.id) {
      fetchTemplates();
    }
  }, [ctxCustomer?.id]);

  function fetchTemplates() {
    getData<Customer>(`/api/customers/${ctxCustomer?.id}`, data => setCustomerTemplates(data.templates));
  }

  const handleCustomerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;

    if (id === "name" || id === "type" || id === "file_type") {
      setNewTemplateData(prev => ({ ...prev, [id]: value }));
    } else {
      setFormCustomer(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = () => {
    if (!formCustomer.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    patchData<Customer>(`/api/admin/customers/${ctxCustomer?.id}`, formCustomer, updated => {
      toast.success("Customer updated successfully");
      setCtxCustomer(updated);
    });
  };

  const changeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileObj(file);
      setNewTemplateData(prev => ({ ...prev, file }));
    }
  };

  const clearFile = () => {
    setFileObj(null);
    setNewTemplateData(prev => ({ ...prev, file: null }));
  };

  const handleUploadTemplate = () => {
    if (!newTemplateData.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!fileObj) {
      toast.error("Template file is required");
      return;
    }

    const dataTemplate = {
      name: newTemplateData.name,
      language: selectedLanguageOption?.value,
      type: newTemplateData.type,
    };

    const formData = new FormData();
    formData.append("template", fileObj, fileObj.name);
    formData.append("data", JSON.stringify(dataTemplate));

    postData(`/api/customers/${ctxCustomer?.id}/templates/upload`, formData, () => {
      toast.success("Template uploaded successfully");
      setFileObj(null);
      setNewTemplateData({ name: "", type: "", file: null });
      fetchTemplates();
    });
  };

  const deleteTemplate = (templateId: string) => {
    deleteData(`/api/templates/${templateId}`, () => {
      toast.success("Template deleted successfully");
      setCustomerTemplates(prev => prev.filter(t => t.id !== templateId));
    });
  };

  const downloadTemplate = (template: Template) => {
    const a = document.createElement("a");
    a.href = `/api/files/templates/${template.file_id}`;
    a.download = template.name || template.filename;
    a.click();
  };

  return (
    <div>
      <SectionTitleLineWithButton icon={mdiAccountEdit} title={`Customer: ${ctxCustomer?.name}`}>
        <Buttons>
          <Button
            small
            text="Assessments"
            icon={mdiListBox}
            onClick={() => navigate(`/customers/${ctxCustomer?.id}/assessments`)}
          />
          <Button
            small
            text="Targets"
            icon={mdiTarget}
            onClick={() => navigate(`/customers/${ctxCustomer?.id}/targets`)}
          />
        </Buttons>
      </SectionTitleLineWithButton>

      <Grid className="grid-cols-2 !items-start">
        <Card>
          <CardTitle title="Customer details" />
          <Grid className="gap-4">
            <Input
              type="text"
              label="Company name"
              helperSubtitle="Required"
              placeholder="Company name"
              id="name"
              value={formCustomer.name}
              onChange={handleCustomerFormChange}
            />
            <SelectWrapper
              label="Language"
              id="language"
              options={languageOptions}
              value={selectedLanguageOption}
              onChange={option => setFormCustomer(prev => ({ ...prev, language: option.value }))}
            />
          </Grid>
          <Divider />
          <Buttons>
            <Button text="Submit" onClick={handleSubmit} />
            <Button variant="secondary" text="Cancel" onClick={() => navigate("/customers")} />
          </Buttons>
        </Card>

        <Card>
          <CardTitle title="Custom templates" />
          <Grid className="gap-4">
            <Grid className="grid-cols-2">
              <Input
                type="text"
                label="Template Name"
                placeholder="Insert name for the template"
                id="name"
                value={newTemplateData.name || ""}
                onChange={handleCustomerFormChange}
              />
              <Input
                type="text"
                label="Template Type"
                placeholder="e.g., Template for assessments"
                id="type"
                value={newTemplateData.type}
                onChange={handleCustomerFormChange}
              />
            </Grid>
            <UploadFile
              label="Choose template file"
              inputId="file"
              filename={fileObj?.name}
              name="templateFile"
              accept=".docx,.xlsx"
              onChange={changeFile}
              onButtonClick={clearFile}
            />
            <Buttons>
              <Button text="Upload" onClick={handleUploadTemplate} />
            </Buttons>
            <Divider />
            <Table
              data={customerTemplates.map(template => ({
                Name: template.name,
                Filename: template.filename,
                "File Type": template.file_type,
                "Template Type": template.type,
                buttons: (
                  <Buttons noWrap>
                    <Button icon={mdiDownload} onClick={() => downloadTemplate(template)} variant="secondary" />
                    <Button icon={mdiTrashCan} onClick={() => deleteTemplate(template.id)} variant="danger" />
                  </Buttons>
                ),
              }))}
              perPageCustom={5}
            />
          </Grid>
        </Card>
      </Grid>
    </div>
  );
}
