import { mdiBroom, mdiClipboardText, mdiFormatColorHighlight } from "@mdi/js";
import * as monaco from "monaco-editor";
import { useState } from "react";
import DescribedCode from "../Composition/DescribedCode";
import Grid from "../Composition/Grid";
import Modal from "../Composition/Modal";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";
import { SelectOption } from "../Form/SelectWrapper.types";
import MonacoCodeEditor from "./MonacoCodeEditor";
import { MonacoTextSelection } from "./MonacoCodeEditor.types";
import { PocDoc } from "./Poc.types";

type PocCodeEditorProps = {
  label?: string;
  pocDoc: PocDoc;
  currentIndex;
  highlightsProperty;
  code: string;
  disableViewHighlights: boolean;
  selectedLanguage: string;
  ideStartingLineNumber?: number;
  textHighlights?: MonacoTextSelection[];
  onChange?: (value: string) => void;
  onSetCodeSelection?: (currentIndex: number, property: string, textSelection: MonacoTextSelection[]) => void;
  onLanguageOptionsInit?: (options: SelectOption[]) => void;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
};

/** @warning This component could probably be better, for instance it is not fully and properly typed, probably it is best to not be used outside of the pocs */
export default function PocCodeEditor({
  label = "",
  pocDoc,
  currentIndex,
  selectedLanguage,
  highlightsProperty,
  code,
  disableViewHighlights,
  ideStartingLineNumber,
  textHighlights = [],
  onChange = () => {},
  onSetCodeSelection = () => {},
  onLanguageOptionsInit = () => {},
  options = {},
}: PocCodeEditorProps) {
  const [selectedText, setSelectedText] = useState<MonacoTextSelection[]>([]);
  const [showHighligtedTextModal, setShowHighlightedTextModal] = useState(false);
  return (
    <Grid className="gap-4">
      <Modal
        className="overflow-auto"
        isActive={showHighligtedTextModal}
        title="Code that will be highlighted"
        subtitle="Click on a selected text to remove it"
        confirmButtonLabel="Close"
        onCancel={() => setShowHighlightedTextModal(false)}
      >
        <Grid>
          {pocDoc[highlightsProperty]?.map((highlight, i) => {
            const [line, col, text] = highlight?.selectionPreview.split(":");
            const codeSelectionKey = `poc-${currentIndex}-code-selection-${i}-${pocDoc.key}`;
            return (
              <Button
                className="hover:bg-red-400/20"
                variant="outline-only"
                onClick={() =>
                  onSetCodeSelection(
                    currentIndex,
                    highlightsProperty,
                    pocDoc[highlightsProperty].filter((_, j) => i !== j)
                  )
                }
                key={codeSelectionKey}
              >
                <DescribedCode className="p-2" subtitle={`line ${line} col ${col}`} text={text} />
              </Button>
            );
          })}
        </Grid>
      </Modal>

      <Buttons containerClassname="flex-grow" className="justify-between">
        <Buttons>
          <Button
            small
            variant="warning"
            title="Add highlight"
            icon={mdiFormatColorHighlight}
            iconSize={24}
            onClick={() =>
              onSetCodeSelection(currentIndex, highlightsProperty, [
                ...(pocDoc[highlightsProperty] ?? []),
                ...selectedText,
              ])
            }
          />
          <Button
            small
            disabled={disableViewHighlights}
            variant="outline-only"
            title="Show all selections"
            icon={mdiClipboardText}
            iconSize={24}
            onClick={() => setShowHighlightedTextModal(true)}
          />
        </Buttons>

        <Button
          small
          variant="danger"
          title="Clear highlights"
          icon={mdiBroom}
          iconSize={24}
          onClick={() => {
            onSetCodeSelection(currentIndex, highlightsProperty, []);
          }}
        />
      </Buttons>

      <MonacoCodeEditor
        label={label}
        value={code}
        ideStartingLineNumber={ideStartingLineNumber}
        textHighlights={textHighlights}
        onTextSelection={setSelectedText}
        language={selectedLanguage}
        onLanguageOptionsInit={onLanguageOptionsInit}
        onChange={onChange}
        options={options}
      />
    </Grid>
  );
}
