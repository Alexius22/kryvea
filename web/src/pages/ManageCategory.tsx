import { mdiDatabaseEdit, mdiPlus } from "@mdi/js";
import { Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import Buttons from "../components/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/Modal";
import Divider from "../components/Divider";
import FormField from "../components/Form/Field";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import SectionTitleLineWithButton from "../components/Section/TitleLineWithButton";
import { getPageTitle } from "../config";

const ManageCategory = () => {
  const [isModalInfoActive, setIsModalInfoActive] = useState(false);
  const [selectedLanguageOptions, setSelectedLanguageOptions] = useState<SelectOption | SelectOption[]>({
    label: "Italian",
    value: "IT",
  });
  const [LanguageSelectOptions, setLanguageSelectOptions] = useState<SelectOption[]>([
    { label: "Chinese", value: "CN" },
    { label: "Dutch", value: "NL" },
    { label: "French", value: "FR" },
    { label: "German", value: "DE" },
    { label: "Italian", value: "IT" },
    { label: "Japanese", value: "JP" },
    { label: "Portuguese", value: "PT" },
    { label: "Russian", value: "RU" },
    { label: "Spanish", value: "ES" },
  ]);
  const [additionalFields, setAdditionalFields] = useState<SelectOption[]>([]);

  const handleModalAction = () => {
    if (selectedLanguageOptions && !Array.isArray(selectedLanguageOptions)) {
      setAdditionalFields(prev => [...prev, selectedLanguageOptions]);
    }
    setIsModalInfoActive(false);
  };

  useEffect(() => {
    document.title = getPageTitle("Manage Category");
  }, []);

  return (
    <div>
      <CardBoxModal
        title="Add language"
        buttonLabel="Add"
        isActive={isModalInfoActive}
        onConfirm={handleModalAction}
        onCancel={() => setIsModalInfoActive(false)}
      >
        <p>The English language option is not available, as it is the default language.</p>
        <Formik initialValues={{}} onSubmit={undefined}>
          <Form>
            <FormField label="Select language" singleChild>
              <SelectWrapper
                options={LanguageSelectOptions}
                onChange={selectedOptions => setSelectedLanguageOptions(selectedOptions)}
                value={selectedLanguageOptions}
              />
            </FormField>
          </Form>
        </Formik>
      </CardBoxModal>

      <SectionTitleLineWithButton icon={mdiDatabaseEdit} title="Manage Category">
        <Button icon={mdiPlus} label="New language" roundedFull small onClick={() => setIsModalInfoActive(true)} />
      </SectionTitleLineWithButton>
      <CardBox>
        <Formik initialValues={undefined} onSubmit={undefined}>
          <Form>
            <FormField label={["Identifier", "Name"]}>
              <Field name="identifier" id="identifier" placeholder="A01:2021" />
              <Field name="Name" id="Name" placeholder="Name" />
            </FormField>
            <Divider />
            <p className="mb-2">
              <b>English</b>
            </p>
            <FormField label={["Generic description", "Generic remediation"]} hasTextareaHeight>
              <Field name="gen_desc_en" as="textarea" placeholder="Description here" />
              <Field name="gen_rem_en" as="textarea" placeholder="Description here" />
            </FormField>
            {additionalFields.map((language, index) => (
              <div key={index}>
                <Divider />
                <p className="mb-2">
                  <b>{language.label}</b>
                </p>
                <FormField label={["Generic description", "Generic remediation"]} hasTextareaHeight>
                  <Field
                    name={`gen_desc_${language.value.toLowerCase()}`}
                    as="textarea"
                    placeholder={"Description here"}
                  />
                  <Field
                    name={`gen_rem_${language.value.toLowerCase()}`}
                    as="textarea"
                    placeholder={"Description here"}
                  />
                </FormField>
              </div>
            ))}
            <Divider />
            <FormField label="References" hasTextareaHeight>
              <Field name="ref" as="textarea" placeholder="References here" />
            </FormField>
            <Divider />
            <Buttons>
              <Button type="submit" label="Submit" />
              <Button type="cancel" outline label="Cancel" />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default ManageCategory;
