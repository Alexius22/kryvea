import { mdiDatabaseEdit, mdiPlus } from "@mdi/js";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import CardBox from "../components/CardBox/CardBox";
import CardBoxModal from "../components/CardBox/CardBoxModal";
import Grid from "../components/Composition/Grid";
import Divider from "../components/Divider";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import { SelectOption } from "../components/Form/SelectWrapper.types";
import Textarea from "../components/Form/Textarea";
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
            <SelectWrapper
              label="Select language"
              options={LanguageSelectOptions}
              onChange={selectedOptions => setSelectedLanguageOptions(selectedOptions)}
              value={selectedLanguageOptions}
            />
          </Form>
        </Formik>
      </CardBoxModal>

      <SectionTitleLineWithButton icon={mdiDatabaseEdit} title="Manage Category">
        <Button icon={mdiPlus} text="New language" small onClick={() => setIsModalInfoActive(true)} />
      </SectionTitleLineWithButton>
      <CardBox>
        <Formik initialValues={undefined} onSubmit={undefined}>
          <Form>
            <Grid className="grid-cols-2">
              <Input type="text" label="Identifier" id="identifier" placeholder="A01:2021" />
              <Input type="text" label="Name" id="name" placeholder="Vulnerability name" />
            </Grid>
            <Divider />
            <p className="mb-2 font-bold">English</p>
            <Grid className="grid-cols-2">
              <Input type="text" label="Generic description" id="gen_desc_en" placeholder="Description here" />
              <Textarea label="Generic remediation" id="gen_rem_en" placeholder="Description here" />
            </Grid>
            {additionalFields.map((language, index) => (
              <div key={index}>
                <Divider />
                <p className="mb-2 font-bold">{language.label}</p>
                <Grid className="grid-cols-2">
                  <Textarea
                    label="Generic remediation"
                    id={`gen_desc_${language.value.toLowerCase()}`}
                    placeholder="Description here"
                  />
                  <Textarea
                    label="Generic remediation"
                    id={`gen_rem_${language.value.toLowerCase()}`}
                    placeholder="Description here"
                  />
                </Grid>
              </div>
            ))}
            <Divider />
            <Textarea label="References" id="references" placeholder="References here" />
            <Divider />
            <Buttons>
              <Button type="primary" text="Submit" onClick={() => {}} />
              <Button type="secondary" text="Cancel" onClick={() => {}} />
            </Buttons>
          </Form>
        </Formik>
      </CardBox>
    </div>
  );
};

export default ManageCategory;
