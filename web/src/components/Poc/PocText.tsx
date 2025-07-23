import { mdiPencil } from "@mdi/js";
import "codemirror/mode/htmlmixed/htmlmixed";
import React, { useState } from "react";
import Flex from "../Composition/Flex";
import Button from "../Form/Button";
import Label from "../Form/Label";
import SelectWrapper from "../Form/SelectWrapper";
import { SelectOption } from "../Form/SelectWrapper.types";
import Textarea from "../Form/Textarea";
import MonacoCodeEditor from "./MonacoCodeEditor";
import { MonacoTextSelection } from "./MonacoCodeEditor.types";
import { PocDoc, PocTextDoc } from "./Poc.types";
import PocTemplate from "./PocTemplate";

type PocTextProps = {
  pocDoc: PocTextDoc;
  currentIndex;
  pocList: PocDoc[];
  onPositionChange: (currentIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange: <T>(currentIndex, key: keyof Omit<T, "key">) => (e: React.ChangeEvent) => void;
  onRemovePoc: (currentIndex: number) => void;
  onSetCodeSelection: (currentIndex: number, textSelection: MonacoTextSelection) => void;
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
  onSetCodeSelection,
  selectedPoc,
  setSelectedPoc,
}: PocTextProps) {
  // prettier-ignore
  // const languages = useMemo(() => ["Plaintext","Bash","C","C++","C#","CSS","Dart","Dockerfile","F#","Go","HTML","Java","JavaScript","JSON","Julia","LaTeX","Less","Lua","Makefile","Markdown","MSSQL","Pearl","PHP","PowerShell","Python","R","Ruby","Rust","SCSS","SQL","Swift","TypeScript","VisualBasic","XML","YAML"], []);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languageOptions, setLanguageOptions] = useState<SelectOption[]>([]);
  const [selectedText, setSelectedText] = useState<MonacoTextSelection>();

  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const textInputId = `poc-text-${currentIndex}-${pocDoc.key}`;
  const languageInputId = `poc-language-${currentIndex}-${pocDoc.key}`;

  const setHighlightedText = () => {};

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
        <Label htmlFor={descriptionTextareaId} text="Description" />
        <Textarea
          value={pocDoc.description}
          id={descriptionTextareaId}
          onChange={onTextChange<PocTextDoc>(currentIndex, "description")}
        />
      </div>

      <Flex className="items-end gap-4">
        <div>
          <Label htmlFor={languageInputId} text="Language" />
          <SelectWrapper
            className="w-64"
            options={languageOptions.map(({ label, value }) => ({ label, value }))}
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
        <Button
          variant="warning"
          text="Save text highlight"
          onClick={() => onSetCodeSelection(currentIndex, selectedText)}
        />
      </Flex>

      <div className="col-span-4 grid w-full max-w-full">
        <label htmlFor={textInputId}>Text</label>
        <div
          className="w-full max-w-full overflow-auto border border-[color:--border-primary]"
          style={{ width: "100%" }}
        >
          <MonacoCodeEditor
            onTextSelection={setSelectedText}
            language={selectedLanguage}
            setLanguageOptions={setLanguageOptions}
          />
        </div>
      </div>
    </PocTemplate>
  );
}
