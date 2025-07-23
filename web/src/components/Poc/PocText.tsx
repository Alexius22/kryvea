import { mdiPencil } from "@mdi/js";
import "codemirror/mode/htmlmixed/htmlmixed";
import React, { useState } from "react";
import Flex from "../Composition/Flex";
import Grid from "../Composition/Grid";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";
import Input from "../Form/Input";
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
  const [selectedLanguage, setSelectedLanguage] = useState(pocDoc.text_language || "Plaintext");
  const [languageOptions, setLanguageOptions] = useState<SelectOption[]>([]);
  const [selectedText, setSelectedText] = useState<MonacoTextSelection>();
  const [startingLineNumber, setStartingLineNumber] = useState(pocDoc?.starting_line_number || 0);

  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const textInputId = `poc-text-${currentIndex}-${pocDoc.key}`;
  const languageInputId = `poc-language-${currentIndex}-${pocDoc.key}`;
  const startingLineNumberId = `poc-starting-line-number-${currentIndex}-${pocDoc.key}`;

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
      <Grid className="poc-text">
        <Textarea
          label="Description"
          value={pocDoc.description}
          id={descriptionTextareaId}
          onChange={onTextChange<PocTextDoc>(currentIndex, "description")}
        />
        <Grid className="gap-4">
          <Flex className="gap-4">
            <SelectWrapper
              label="Language"
              className="w-64"
              options={languageOptions.map(({ label, value }) => ({ label, value }))}
              value={{
                label: selectedLanguage || pocDoc.text_language,
                value: selectedLanguage || pocDoc.text_language,
              }}
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
            <Input
              className="w-[55px] rounded text-center"
              label="Start"
              type="number"
              value={startingLineNumber + 1}
              min={1}
              onChange={e => setStartingLineNumber(e - 1)}
              id={startingLineNumberId}
            />
            <Buttons>
              <Button
                variant="warning"
                text="Save text highlight"
                onClick={() => onSetCodeSelection(currentIndex, selectedText)}
              />
              <Button
                variant="danger"
                text="Clear text highlight"
                onClick={() => {
                  setSelectedText(undefined);
                  onSetCodeSelection(currentIndex, undefined);
                }}
              />
            </Buttons>
          </Flex>

          <MonacoCodeEditor
            defaultValue={pocDoc.text_data}
            startingLineNumber={startingLineNumber}
            onTextSelection={setSelectedText}
            language={selectedLanguage}
            setLanguageOptions={setLanguageOptions}
            onChange={code =>
              onTextChange<PocTextDoc>(
                currentIndex,
                "text_data"
              )({
                target: { value: code },
              } as any)
            }
          />
        </Grid>
      </Grid>
    </PocTemplate>
  );
}
