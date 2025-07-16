import { mdiPencil } from "@mdi/js";
import "codemirror/mode/htmlmixed/htmlmixed";
import React, { useState } from "react";
import Flex from "../Composition/Flex";
import Input from "../Form/Input";
import Label from "../Form/Label";
import SelectWrapper from "../Form/SelectWrapper";
import { SelectOption } from "../Form/SelectWrapper.types";
import Textarea from "../Form/Textarea";
import MonacoCodeEditor from "./MonacoCodeEditor";
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
  // const languages = useMemo(() => ["Plaintext","Bash","C","C++","C#","CSS","Dart","Dockerfile","F#","Go","HTML","Java","JavaScript","JSON","Julia","LaTeX","Less","Lua","Makefile","Markdown","MSSQL","Pearl","PHP","PowerShell","Python","R","Ruby","Rust","SCSS","SQL","Swift","TypeScript","VisualBasic","XML","YAML"], []);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languageOptions, setLanguageOptions] = useState<SelectOption[]>([]);
  const [startingLineNumber, setStartingLineNumber] = useState(1);
  console.log("languages", languageOptions);

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
        <Label htmlFor={descriptionTextareaId} text="Description" />
        <Textarea
          value={pocDoc.description}
          id={descriptionTextareaId}
          onChange={onTextChange<PocTextDoc>(currentIndex, "description")}
        />
      </div>

      <Flex className="items-center gap-4">
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
        <div>
          <Label htmlFor="" text="Starting line number" />
          <Input
            disabled
            type="number"
            value={startingLineNumber}
            onChange={setStartingLineNumber}
            className="input w-[55px] rounded text-center"
          />
        </div>
      </Flex>

      <div className="col-span-4 grid w-full max-w-full">
        <label htmlFor={textInputId}>Text</label>
        <div
          className="w-full max-w-full overflow-auto border border-[color:--border-primary]"
          style={{ width: "100%" }}
        >
          {/* <CodeMirror
            value={pocDoc.text_data}
            options={{
              mode: "htmlmixed",
              theme: "gruvbox-dark",
              lineNumbers: true,
              lineNumberFormatter: (lineNumber: number) => lineNumber + (startingLineNumber - 1),
              highlightActiveLine: true,
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
          /> */}
          <MonacoCodeEditor language={selectedLanguage} setLanguageOptions={setLanguageOptions} />
        </div>
      </div>
    </PocTemplate>
  );
}
