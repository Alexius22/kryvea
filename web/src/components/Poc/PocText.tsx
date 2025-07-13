import { mdiPencil } from "@mdi/js";
import "codemirror/mode/htmlmixed/htmlmixed";
import React, { useMemo, useState } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import Grid from "../Composition/Grid";
import Input from "../Form/Input";
import SelectWrapper from "../Form/SelectWrapper";
import Textarea from "../Form/Textarea";
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
  const languages = useMemo(() => ["Plaintext","Bash","C","C++","C#","CSS","Dart","Dockerfile","F#","Go","HTML","Java","JavaScript","JSON","Julia","LaTeX","Less","Lua","Makefile","Markdown","MSSQL","Pearl","PHP","PowerShell","Python","R","Ruby","Rust","SCSS","SQL","Swift","TypeScript","VisualBasic","XML","YAML"], []);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [startingLineNumber, setStartingLineNumber] = useState(1);

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
      <div className="poc-text col-span-8 grid">
        <label htmlFor={descriptionTextareaId}>Description</label>
        <Textarea
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
          value={{ label: selectedLanguage || pocDoc.text_language, value: selectedLanguage || pocDoc.text_language }}
          onChange={({ value }) => {
            setSelectedLanguage(value);
            onTextChange<PocTextDoc>(
              currentIndex,
              "text_language"
            )({
              target: { value },
            } as any);
          }}
          id={languageInputId}
        />
      </div>

      <Grid className="gap-0">
        <label htmlFor="">Starting line number</label>
        <Input type="number" value={startingLineNumber} onChange={setStartingLineNumber} />
      </Grid>

      <div className="col-span-4 grid w-full max-w-full">
        <label htmlFor={textInputId}>Text</label>
        <div
          className="w-full max-w-full overflow-auto border border-[color:--border-primary]"
          style={{ width: "100%" }}
        >
          <CodeMirror
            value={pocDoc.text_data}
            options={{
              mode: "htmlmixed",
              theme: "gruvbox-dark",
              lineNumbers: true,
              lineNumberFormatter: (lineNumber: number) => lineNumber + (startingLineNumber - 1),
            }}
            // lineWrapping: true,
            onChange={(_, __, value) => {
              onTextChange<PocTextDoc>(
                currentIndex,
                "text_data"
              )({
                target: { value },
              } as any);
            }}
          />
        </div>
      </div>
    </PocTemplate>
  );
}
