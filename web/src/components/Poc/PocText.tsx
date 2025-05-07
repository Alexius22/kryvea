import { mdiPencil } from "@mdi/js";
import React, { useState } from "react";
import Icon from "../Icon/Icon";
import { PocDoc, PocTextDoc } from "./Poc.types";
import PocTemplate from "./PocTemplate";
import SelectWrapper from "../Form/SelectWrapper";
import { SelectOption } from "../Form/SelectWrapper.types";

type PocTextProps = {
  pocDoc: PocTextDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
  onRemovePoc: (currentIndex: number) => void;
};

export default function PocText({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onTextChange,
  onRemovePoc,
}: PocTextProps) {
  // prettier-ignore
  const [languages] = useState(["Bash","C","C++","C#","CSS","Dart","Dockerfile","F#","Go","HTML","Java","JavaScript","JSON","Julia","LaTeX","Less","Lua","Makefile","Markdown","MSSQL","Pearl","PHP","PowerShell","Python","R","Ruby","Rust","SCSS","SQL","Swift","TypeScript","VisualBasic","XML","YAML"]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const textInputId = `poc-text-${currentIndex}-${pocDoc.key}`;
  const languageInputId = `poc-language-${currentIndex}-${pocDoc.key}`;

  return (
    <PocTemplate
      {...{
        pocDoc,
        currentIndex,
        pocList,
        icon: mdiPencil,
        onPositionChange,
        onRemovePoc,
      }}
    >
      <div className="col-span-8 grid">
        <label htmlFor={descriptionTextareaId}>Description</label>
        <textarea
          className="rounded dark:bg-slate-800"
          value={pocDoc.description}
          id={descriptionTextareaId}
          onChange={onTextChange<PocTextDoc>(currentIndex, "description")}
        />
      </div>

      <div className="col-span-4 grid">
        <label htmlFor={languageInputId}>Language</label>
        <SelectWrapper
          className="max-w-64"
          options={languages.map(l => ({ label: l, value: l }))}
          onChange={({ value }) => {
            setSelectedLanguage(value);
          }}
          id={languageInputId}
        />
      </div>

      <div className="col-span-4 grid">
        <label htmlFor={textInputId}>Text</label>
        <textarea
          id={textInputId}
          className="rounded dark:bg-slate-800"
          value={pocDoc.text}
          onChange={onTextChange<PocTextDoc>(currentIndex, "text")}
        />
      </div>
    </PocTemplate>
  );
}
