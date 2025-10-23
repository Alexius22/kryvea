import { mdiBroom, mdiClipboardText, mdiMarker, mdiPalette } from "@mdi/js";
import type * as monaco from "monaco-editor";
import { useContext, useState } from "react";
import { GlobalContext } from "../../App";
import DescribedCode from "../Composition/DescribedCode";
import Grid from "../Composition/Grid";
import Modal from "../Composition/Modal";
import Button from "../Form/Button";
import Buttons from "../Form/Buttons";
import Checkbox from "../Form/Checkbox";
import ColorPicker from "../Form/ColorPicker";
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
  const [textLineWrap, setTextLineWrap] = useState(false);
  const [minimap, setMinimap] = useState(false);
  const {
    useCtxCodeHighlightColor: [ctxCodeHighlightColor, setCtxCodeHighlightColor],
  } = useContext(GlobalContext);

  return (
    <Grid className="gap-4">
      {showHighligtedTextModal && (
        <Modal
          title="Code that will be highlighted"
          subtitle="Click on a selected text to remove it"
          confirmButtonLabel="Close"
          onCancel={() => setShowHighlightedTextModal(false)}
        >
          <Grid>
            {pocDoc[highlightsProperty]?.map((highlight: MonacoTextSelection, i) => {
              const {
                start: { line, col },
                selectionPreview: text,
              } = highlight;
              const codeSelectionKey = `poc-${currentIndex}-code-selection-${i}-${pocDoc.key}`;
              return (
                <Button
                  className="border border-[color:--border-secondary] hover:bg-red-400/20"
                  variant="secondary"
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
      )}
      <Buttons containerClassname="flex-grow" className="justify-between">
        <Buttons>
          <Button
            disabled={selectedText.length < 1}
            small
            variant="warning"
            title="Add highlight"
            icon={mdiMarker}
            iconSize={24}
            customColor={ctxCodeHighlightColor}
            onClick={() => {
              const coloredSelection = selectedText.map(sel => ({
                ...sel,
                color: ctxCodeHighlightColor,
              }));
              onSetCodeSelection(currentIndex, highlightsProperty, [
                ...(pocDoc[highlightsProperty] ?? []),
                ...coloredSelection,
              ]);
            }}
          />
          <ColorPicker
            icon={mdiPalette}
            title="Highlight color"
            value={ctxCodeHighlightColor}
            onChange={setCtxCodeHighlightColor}
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
          <Checkbox
            id={`poc-${pocDoc.index}-line-wrap`}
            label="Line wrap"
            onChange={e => setTextLineWrap(e.target.checked)}
            checked={textLineWrap}
          />
          <Checkbox
            id={`poc-${pocDoc.index}-minimap`}
            label="Minimap"
            onChange={e => setMinimap(e.target.checked)}
            checked={minimap}
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
        removeDisappearedHighlights={indexes => {
          const filteredHighlights = pocDoc[highlightsProperty]?.filter((_, i) => !indexes.includes(i));
          onSetCodeSelection(currentIndex, highlightsProperty, filteredHighlights);
        }}
        onTextSelection={setSelectedText}
        language={selectedLanguage}
        onLanguageOptionsInit={onLanguageOptionsInit}
        onChange={onChange}
        options={{ ...options, wordWrap: textLineWrap ? "on" : "off", minimap: { enabled: minimap } }}
      />
    </Grid>
  );
}
