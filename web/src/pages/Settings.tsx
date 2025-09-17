import { useEffect, useState } from "react";
import { getData, putData } from "../api/api";
import Card from "../components/Composition/Card";
import CardTitle from "../components/Composition/CardTitle";
import Divider from "../components/Composition/Divider";
import Grid from "../components/Composition/Grid";
import Button from "../components/Form/Button";
import Buttons from "../components/Form/Buttons";
import Input from "../components/Form/Input";
import SelectWrapper from "../components/Form/SelectWrapper";
import type { Settings } from "../types/common.types";
import { languageMapping } from "../utils/constants";
import { getPageTitle } from "../utils/helpers";

const languageOptions = Object.entries(languageMapping).map(([code, label]) => ({
  value: code,
  label,
}));

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({ image_upload_size: 100, default_language_category: "en" });

  useEffect(() => {
    document.title = getPageTitle("Settings");
    getData("/api/admin/settings", setSettings);
  }, []);

  const selectedLanguageOption = languageOptions.find(opt => opt.value === settings.default_language_category);

  const handleSizeUpload = e => {
    setSettings(prev => ({ ...prev, image_upload_size: e.target.value }));
  };

  const handleSubmit = () => {
    putData("/api/admin/settings", settings);
  };

  return (
    <div>
      <Card>
        <CardTitle title="Settings" />
        <Grid className="gap-4">
          <Input
            type="number"
            label="Max poc image file size (MB)"
            helperSubtitle="Required"
            placeholder="100 MB"
            id="image_upload_size"
            value={settings.image_upload_size}
            onChange={handleSizeUpload}
          />
          <SelectWrapper
            label="Default language when creating a new category"
            id="language"
            options={languageOptions}
            value={selectedLanguageOption}
            onChange={option => setSettings(prev => ({ ...prev, default_language_category: option.value }))}
          />
        </Grid>
        <Divider />
        <Buttons>
          <Button text="Submit" onClick={handleSubmit} />
        </Buttons>
      </Card>
    </div>
  );
}
