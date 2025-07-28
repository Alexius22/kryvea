import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import Grid from "../Composition/Grid";
import Label from "../Form/Label";
import { MonacoTextSelection } from "./MonacoCodeEditor.types";

interface MonacoCodeEditorProps {
  language?: string;
  label?: string;
  value?: string;
  theme?: string;
  ideStartingLineNumber?: number;
  height?: string;
  stopLineNumberAt?: number;
  textHighlights?: MonacoTextSelection[];
  removeDisappearedHighlights?: (indexes: number[]) => void;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onChange?: (value: string) => void;
  onLanguageOptionsInit?;
  onTextSelection?;
}

export default function MonacoCodeEditor({
  language,
  label = "",
  value,
  theme = "vs-dark",
  ideStartingLineNumber = 0,
  height = "400px",
  stopLineNumberAt,
  textHighlights = [],
  removeDisappearedHighlights = () => {},
  options,
  onChange = () => {},
  onLanguageOptionsInit = () => {},
  onTextSelection = (x: MonacoTextSelection) => {},
}: MonacoCodeEditorProps) {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
  const decorationsRef = useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

  const highlightCode = (className = "bg-green-900") => {
    if (!editor) {
      return;
    }
    const model = editor.getModel();
    if (!model) {
      return;
    }

    const decorations: monaco.editor.IModelDeltaDecoration[] = textHighlights
      .filter(({ start, end, selectionPreview }, i) => {
        const range = new monaco.Range(start.line, start.col, end.line, end.col);
        const actualText = model.getValueInRange(range);
        const textHighlightMatches = actualText === selectionPreview;

        return textHighlightMatches;
      })
      .map(({ start, end }) => ({
        range: new monaco.Range(start.line, start.col, end.line, end.col),
        options: {
          className,
          isWholeLine: false,
        },
      }));

    if (!decorationsRef.current) {
      decorationsRef.current = editor.createDecorationsCollection(decorations);
    } else {
      decorationsRef.current.set(decorations);
    }
  };

  const checkDisappearedHighlights = () => {
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const disappearedHighlightsIndexes = textHighlights.flatMap(({ start, end, selectionPreview }, i) => {
      const range = new monaco.Range(start.line, start.col, end.line, end.col);
      const actualText = model.getValueInRange(range);
      const textHighlightMatches = actualText === selectionPreview;

      if (!textHighlightMatches) {
        return i;
      }

      return [];
    });

    if (disappearedHighlightsIndexes.length > 0) {
      removeDisappearedHighlights(disappearedHighlightsIndexes);
    }
  };

  useEffect(() => {
    highlightCode();
  }, [textHighlights, editor]);
  useEffect(() => {
    if (!editor) {
      return;
    }

    const defuseDisapparedHighlights = setTimeout(checkDisappearedHighlights, 500);
    return () => {
      clearTimeout(defuseDisapparedHighlights);
    };
  }, [value]);

  const handleBeforeMount = (monaco: Monaco) => {
    monaco.languages.register({ id: "http" });

    monaco.languages.setMonarchTokensProvider("http", {
      tokenizer: {
        root: [
          [/^HTTP\/\d\.\d \d{3} .*/, "keyword"],

          // Request methods
          [/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\b/, "keyword"],

          // URLs
          [/https?:\/\/\S+/, "string"],

          // Headers
          [/^[\w-]+(?=:)/, "type.identifier"],

          // JSON key:value pairs inside payloads
          [/"(\w+)"\s*:/, "attribute.name"],

          // JSON strings
          [/"([^"\\]|\\.)*"/, "string"],

          // JSON numbers
          [/\b-?\d+(\.\d+)?([eE][+-]?\d+)?\b/, "number"],

          // JSON booleans and null
          [/\b(true|false|null)\b/, "keyword"],

          [
            /(<\?)(xml)(\s+version\s*=\s*)("\d\.\d")(\s*\?>)/,
            ["metatag", "metatag", "attribute.name", "string", "metatag"],
          ],

          // XML tags (start or end)
          [/<\/?[\w-]+(\s+[\w-]+(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/, "tag"],

          // XML attribute names and values inside tags
          [/(\w+)(=)(".*?"|'.*?')/, ["attribute.name", "delimiter", "string"]],

          // URL encoded key=value pairs (application/x-www-form-urlencoded)
          [/\b[\w%.-]+=[\w%.-]*\b/, "string"],

          // Multipart boundaries (e.g. --boundary12345)
          [/^--[\w-]+$/, "delimiter"],

          // HTTP status line (response)
          [/^(HTTP\/\d\.\d)\s+(\d{3})\s+([^\r\n]+)/, ["keyword", "number", "string"]],

          // HTTP request line (already have methods, but matching full line)
          [/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+\S+\s+HTTP\/\d\.\d/, "keyword"],

          // Strings
          [/"[^"]*"/, "string"],

          // Numbers
          [/\b\d+(\.\d+)?\b/, "number"],

          // Booleans and null
          [/\b(true|false|null)\b/, "keyword"],

          // Comments
          [/^#.*$/, "comment"],

          // Brackets
          [/[{}[\]]/, "delimiter.bracket"],
        ],
      },
    });

    monaco.languages.setLanguageConfiguration("http", {
      brackets: [
        ["{", "}"],
        ["[", "]"],
      ],
      autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: '"', close: '"' },
      ],
    });

    const languages = monaco.languages.getLanguages();
    onLanguageOptionsInit(
      languages.map(lang => ({
        label: lang.aliases?.[0] || lang.id,
        value: lang.id,
      }))
    );
  };

  const handleEditorMount: OnMount = editor => {
    setEditor(editor);

    editor.onDidChangeCursorSelection(e => {
      const { selection, secondarySelections } = e;
      const selectedText = editor.getModel()?.getValueInRange(selection);
      if (selectedText === "") {
        return;
      }

      const toMonacoTextSelection = (sel: monaco.Selection): MonacoTextSelection => ({
        start: { line: sel.startLineNumber, col: sel.startColumn },
        end: { line: sel.endLineNumber, col: sel.endColumn },
        selectionPreview: `${editor.getModel()?.getValueInRange(sel)}`,
      });

      const secondaryTextSelections = secondarySelections.map(toMonacoTextSelection);
      const allSelections = [...secondaryTextSelections, toMonacoTextSelection(selection)];

      onTextSelection(allSelections);
    });
  };

  return (
    <Grid>
      {label && <Label text={label} />}
      <div className="w-full max-w-full overflow-auto border border-[color:--border-primary]" style={{ width: "100%" }}>
        <Editor
          height={height}
          language={language}
          value={value}
          theme={theme}
          onChange={val => onChange(val || "")}
          beforeMount={handleBeforeMount}
          onMount={handleEditorMount}
          options={{
            lineNumbers: i => (i >= stopLineNumberAt ? "" : `${i + ideStartingLineNumber}`),
            lineNumbersMinChars: 2,
            glyphMargin: false,
            scrollBeyondLastLine: false,
            selectOnLineNumbers: true,
            roundedSelection: true,
            readOnly: false,
            cursorStyle: "line",
            automaticLayout: true,
            wordWrap: "on",
            formatOnType: true,
            formatOnPaste: true,
            minimap: { enabled: true, renderCharacters: true },
            tabSize: 2,
            "semanticHighlighting.enabled": false,
            ...options,
          }}
        />
      </div>
    </Grid>
  );
}
