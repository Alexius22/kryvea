import { mdiDatabaseEdit, mdiPlus, mdiTrashCan } from "@mdi/js";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { deleteData, getData, patchData, postData } from "../api/api";
import Card from "../components/CardBox/Card";
import Grid from "../components/Composition/Grid";
import Modal from "../components/Composition/Modal";
import Divider from "../components/Divider";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import Label from "../components/Form/Label";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import Textarea from "../components/Form/Textarea";
import SectionTitleLineWithButton from "../components/Section/SectionTitleLineWithButton";
import { getPageTitle } from "../config";
import { Category } from "../types/common.types";
import { languageMapping } from "../types/languages";

export const sourceCategoryOptions: SelectOption[] = [
  { value: "owasp_web", label: "OWASP Top 10 Web" },
  { value: "owasp_mobile", label: "OWASP Top 10 Mobile" },
  { value: "owasp_api", label: "OWASP Top 10 API" },
  { value: "nessus", label: "Nessus" },
  { value: "burp", label: "Burp" },
];

export default function CategoryUpsert() {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();

  const languageOptions: SelectOption[] = Object.entries(languageMapping)
    .filter(([code]) => code !== "en")
    .map(([value, label]) => ({ value, label }));

  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [isModalTrashActive, setIsModalTrashActive] = useState(false);

  const [selectedLanguageOption, setSelectedLanguageOption] = useState<SelectOption | null>(null);
  const [additionalFields, setAdditionalFields] = useState<SelectOption[]>([]);

  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState<Category["source"]>();
  const [genericDescription, setGenericDescription] = useState("");
  const [genericRemediation, setGenericRemediation] = useState("");
  const [genericDescriptions, setGenericDescriptions] = useState<Record<string, string>>({});
  const [genericRemediations, setGenericRemediations] = useState<Record<string, string>>({});
  const [references, setReferences] = useState<string[]>([]);

  useEffect(() => {
    document.title = getPageTitle(categoryId ? "Edit Category" : "New Category");

    if (categoryId) {
      getData<Category[]>("/api/categories", categories => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) {
          toast.error("Category not found");
          navigate("/categories");
          return;
        }

        setIdentifier(category.index);
        setName(category.name);
        setSource(category.source);
        setGenericDescription(category.generic_description?.en || "");
        setGenericRemediation(category.generic_remediation?.en || "");
        setReferences(category.references || []);

        const otherLangs = Object.keys(category.generic_description || {}).filter(l => l !== "en");
        setAdditionalFields(
          otherLangs.map(lang => ({
            value: lang,
            label: languageMapping[lang] || lang,
          }))
        );

        setGenericDescriptions(
          otherLangs.reduce(
            (acc, lang) => {
              acc[lang] = category.generic_description?.[lang] || "";
              return acc;
            },
            {} as Record<string, string>
          )
        );
        setGenericRemediations(
          otherLangs.reduce(
            (acc, lang) => {
              acc[lang] = category.generic_remediation?.[lang] || "";
              return acc;
            },
            {} as Record<string, string>
          )
        );
      });
    } else {
      // New category: initialize empty form
      setIdentifier("");
      setName("");
      setGenericDescription("");
      setGenericRemediation("");
      setReferences([]);
      setAdditionalFields([]);
      setGenericDescriptions({});
      setGenericRemediations({});
    }
  }, [categoryId, navigate]);

  const confirmDeleteCategory = () => {
    if (!categoryId) {
      return;
    }

    deleteData<{ message: string }>(`/api/admin/categories/${categoryId}`, () => {
      toast.success(`Category deleted successfully`);
      setIsModalTrashActive(false);
      navigate("/categories");
    });
  };

  const handleModalAction = () => {
    if (selectedLanguageOption && !additionalFields.some(f => f.value === selectedLanguageOption.value)) {
      setAdditionalFields(prev => [...prev, selectedLanguageOption]);
    }
    setIsModalInfoActive(false);
  };

  const handleModalTrashConfirm = () => {
    confirmDeleteCategory();
  };

  const removeAdditionalLanguage = (value: string) => {
    setAdditionalFields(prev => prev.filter(f => f.value !== value));
    setGenericDescriptions(prev => {
      const copy = { ...prev };
      delete copy[value];
      return copy;
    });
    setGenericRemediations(prev => {
      const copy = { ...prev };
      delete copy[value];
      return copy;
    });
  };

  const updateAdditionalField = (lang: string, field: "description" | "remediation", value: string) => {
    if (field === "description") {
      setGenericDescriptions(prev => ({ ...prev, [lang]: value }));
    } else {
      setGenericRemediations(prev => ({ ...prev, [lang]: value }));
    }
  };

  // Submit handler
  const handleSubmit = () => {
    if (!identifier.trim() || !name.trim()) {
      toast.error("Identifier and Name are required");
      return;
    }

    const payload: Omit<Category, "id"> = {
      index: identifier.trim(),
      name: name.trim(),
      source: source,
      generic_description: {
        en: genericDescription,
        ...genericDescriptions,
      },
      generic_remediation: {
        en: genericRemediation,
        ...genericRemediations,
      },
      references: references,
    };

    if (categoryId) {
      patchData<Category>(`/api/admin/categories/${categoryId}`, payload, () => {
        toast.success("Category updated successfully");
        navigate("/categories");
      });
    } else {
      postData<Category>("/api/admin/categories", payload, () => {
        toast.success("Category created successfully");
        navigate("/categories");
      });
    }
  };

  return (
    <div>
      <Modal
        title="Add language"
        confirmButtonLabel="Add"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={() => setIsModalInfoActive(false)}
      >
        <p>The English language option is not available, as it is the default language.</p>
        <SelectWrapper
          label="Select language"
          options={languageOptions.filter(option => !additionalFields.some(f => f.value === option.value))}
          onChange={option => setSelectedLanguageOption(option)}
          value={selectedLanguageOption}
        />
      </Modal>

      {/* Delete single category modal */}
      <Modal
        title="Please confirm: action irreversible"
        confirmButtonLabel="Confirm"
        isActive={isModalTrashActive}
        onConfirm={handleModalTrashConfirm}
        onCancel={() => setIsModalTrashActive(false)}
      >
        <p>Are you sure you want to delete this category?</p>
      </Modal>

      <SectionTitleLineWithButton icon={mdiDatabaseEdit} title={categoryId ? "Edit Category" : "New Category"}>
        <Buttons>
          <Button icon={mdiPlus} text="New language" small onClick={() => setIsModalInfoActive(true)} />
          {categoryId && (
            <Button
              icon={mdiTrashCan}
              text="Remove category"
              small
              onClick={() => setIsModalTrashActive(true)}
              variant="danger"
            />
          )}
        </Buttons>
      </SectionTitleLineWithButton>

      <Card>
        <Grid className="grid-cols-3 gap-4">
          <Input
            type="text"
            label="Identifier"
            id="identifier"
            placeholder="A01:2021"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          />
          <Input
            type="text"
            label="Name"
            id="name"
            placeholder="Vulnerability name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <SelectWrapper
            label="Source"
            id="source"
            options={sourceCategoryOptions}
            value={source ? { label: source, value: source } : null}
            onChange={option => setSource(option.value)}
          />
        </Grid>
        <Divider />
        <Textarea
          label="References"
          id="references"
          placeholder="Enter one reference per line"
          value={references.join("\n")}
          onChange={e => setReferences(e.target.value.split("\n"))}
        />
        <Divider />

        <Label text="English" />
        <Grid className="grid-cols-2 gap-4">
          <Textarea
            label="Generic description"
            id="gen_desc_en"
            placeholder="Description here"
            value={genericDescription}
            onChange={e => setGenericDescription(e.target.value)}
            rows={10}
          />
          <Textarea
            label="Generic remediation"
            id="gen_rem_en"
            placeholder="Remediation here"
            value={genericRemediation}
            onChange={e => setGenericRemediation(e.target.value)}
            rows={10}
          />
        </Grid>

        <Divider />

        {additionalFields.map(language => (
          <div key={language.value}>
            <div className="flex items-center justify-between">
              <Label text={language.label} />
              <Button
                variant="danger"
                icon={mdiTrashCan}
                small
                onClick={() => removeAdditionalLanguage(language.value)}
              />
            </div>
            <Grid className="grid-cols-2 gap-4">
              <Textarea
                label="Generic description"
                id={`gen_desc_${language.value}`}
                placeholder="Description here"
                value={genericDescriptions[language.value] || ""}
                onChange={e => updateAdditionalField(language.value, "description", e.target.value)}
                rows={10}
              />
              <Textarea
                label="Generic remediation"
                id={`gen_rem_${language.value}`}
                placeholder="Remediation here"
                value={genericRemediations[language.value] || ""}
                onChange={e => updateAdditionalField(language.value, "remediation", e.target.value)}
                rows={10}
              />
            </Grid>
            <Divider />
          </div>
        ))}

        <Grid>
          <Buttons>
            <Button text="Submit" onClick={handleSubmit} />
            <Button variant="outline-only" text="Cancel" onClick={() => navigate("/categories")} />
          </Buttons>
        </Grid>
      </Card>
    </div>
  );
}
