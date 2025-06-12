import { mdiPencil } from "@mdi/js";
import React, { useState } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import SelectWrapper from "../Form/SelectWrapper";
import { PocDoc, PocTextDoc } from "./Poc.types";
import PocTemplate from "./PocTemplate";

type PocTextProps = {
  pocDoc: PocTextDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
  onRemovePoc: (currentIndex: number) => void;
  selectedPoc: number;
  setSelectedPoc: (index: number) => void;
};

export default function PocText({
  pocDoc,
  currentIndex,
  pocList,
  onPositionChange,
  onTextChange,
  onRemovePoc,
  selectedPoc,
  setSelectedPoc,
}: PocTextProps) {
  // prettier-ignore
  const [languages] = useState(["Plaintext","Bash","C","C++","C#","CSS","Dart","Dockerfile","F#","Go","HTML","Java","JavaScript","JSON","Julia","LaTeX","Less","Lua","Makefile","Markdown","MSSQL","Pearl","PHP","PowerShell","Python","R","Ruby","Rust","SCSS","SQL","Swift","TypeScript","VisualBasic","XML","YAML"]);
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
        selectedPoc,
        setSelectedPoc,
        title: "Text",
      }}
    >
      <div className="col-span-8 grid">
        <label htmlFor={descriptionTextareaId}>Description</label>
        <textarea
          className=""
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
        <CodeMirror
          value="<p>Write your text here...</p>"
          options={{
            mode: "html",
            theme: "material",
            lineNumbers: true,
          }}
          onChange={(editor, data, value) => {
            onTextChange<PocTextDoc>(
              currentIndex,
              "text"
            )({
              target: { value },
            } as any);
          }}
        />
        {/* <textarea
          id={textInputId}
          className=""
          value={pocDoc.text}
          onChange={onTextChange<PocTextDoc>(currentIndex, "text")}
        /> */}
      </div>
    </PocTemplate>
  );
}
