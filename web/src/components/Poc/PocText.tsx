import { mdiBroom, mdiClipboardText, mdiFormatColorHighlight, mdiPencil } from "@mdi/js";
import "codemirror/mode/htmlmixed/htmlmixed";
import React, { useState } from "react";
import DescribedCode from "../Composition/DescribedCode";
import Flex from "../Composition/Flex";
import Grid from "../Composition/Grid";
import Modal from "../Composition/Modal";
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
  onSetCodeSelection: <T>(
    currentIndex: number,
    property: keyof Omit<T, "key">,
    textSelection: MonacoTextSelection[]
  ) => void;
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
  const [languageOptions, setLanguageOptions] = useState<SelectOption[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<SelectOption>({
    label: pocDoc.text_language || "Plaintext",
    value: pocDoc.text_language || "plaintext",
  });
  const [selectedText, setSelectedText] = useState<MonacoTextSelection[]>([]);
  const [ideStartingLineNumber, setIdeStartingLineNumber] = useState(pocDoc?.starting_line_number || 0);
  const [showHighligtedTextModal, setShowHighlightedTextModal] = useState(false);

  const descriptionTextareaId = `poc-description-${currentIndex}-${pocDoc.key}`;
  const languageInputId = `poc-language-${currentIndex}-${pocDoc.key}`;
  const startingLineNumberId = `poc-starting-line-number-${currentIndex}-${pocDoc.key}`;

  // Should only be called once when the MonacoEditor initializes
  const onLanguageOptionsInit = options => {
    setLanguageOptions(options);
    setSelectedLanguage({
      label: options.find(option => option.value === pocDoc.text_language)?.label,
      value: pocDoc.text_language || "plaintext",
    });
  };

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
      <Modal
        className="overflow-auto"
        isActive={showHighligtedTextModal}
        title="Code that will be highlighted"
        subtitle="Click on a selected text to remove it"
        confirmButtonLabel="Close"
        onCancel={() => setShowHighlightedTextModal(false)}
      >
        <Grid>
          {pocDoc.text_highlights?.map((highlight, i) => {
            const [line, col, text] = highlight?.selectionPreview.split(":");
            const codeSelectionKey = `poc-${currentIndex}-code-selection-${i}-${pocDoc.key}`;
            return (
              <Button
                className="hover:bg-red-400/20"
                variant="outline-only"
                onClick={() =>
                  onSetCodeSelection<PocTextDoc>(
                    currentIndex,
                    "text_highlights",
                    pocDoc.text_highlights.filter((_, j) => i !== j)
                  )
                }
                key={codeSelectionKey}
              >
                <DescribedCode subtitle={`line ${line} col ${col}`} text={text} />
              </Button>
            );
          })}
        </Grid>
      </Modal>
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
                label: selectedLanguage.label || pocDoc.text_language,
                value: selectedLanguage.value || pocDoc.text_language,
              }}
              onChange={selected => {
                setSelectedLanguage(selected);
                onTextChange<PocTextDoc>(
                  currentIndex,
                  "text_language"
                )({
                  target: { value: selected.value },
                } as any);
              }}
              id={languageInputId}
            />
            <Input
              className="w-[55px] rounded text-center"
              label="Start"
              type="number"
              value={ideStartingLineNumber + 1}
              min={1}
              onChange={e => setIdeStartingLineNumber(e - 1)}
              id={startingLineNumberId}
            />
            <Buttons containerClassname="flex-grow" className="justify-between">
              <Buttons>
                <Button
                  variant="warning"
                  title="Add highlight"
                  icon={mdiFormatColorHighlight}
                  iconSize={24}
                  onClick={() =>
                    onSetCodeSelection<PocTextDoc>(currentIndex, "text_highlights", [
                      ...(pocDoc.text_highlights ?? []),
                      ...selectedText,
                    ])
                  }
                />
                <Button
                  disabled={!pocDoc.text_highlights?.length}
                  variant="outline-only"
                  title="Show all selections"
                  icon={mdiClipboardText}
                  iconSize={24}
                  onClick={() => setShowHighlightedTextModal(true)}
                />
              </Buttons>

              <Button
                variant="danger"
                title="Clear highlights"
                icon={mdiBroom}
                iconSize={24}
                onClick={() => {
                  setSelectedText(undefined);
                  onSetCodeSelection<PocTextDoc>(currentIndex, "text_highlights", []);
                }}
              />
            </Buttons>
          </Flex>

          <MonacoCodeEditor
            value={pocDoc.text_data}
            ideStartingLineNumber={ideStartingLineNumber}
            onTextSelection={setSelectedText}
            language={selectedLanguage.value}
            onLanguageOptionsInit={onLanguageOptionsInit}
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
