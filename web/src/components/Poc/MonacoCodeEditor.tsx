import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRef } from "react";
import Grid from "../Composition/Grid";
import Label from "../Form/Label";

interface MonacoCodeEditorProps {
  language?: string;
  label?: string;
  value?: string;
  theme?: string;
  startingLineNumber?: number;
  height?: string;
  stopLineNumberAt?: number;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onChange?: (value: string) => void;
  setLanguageOptions?;
  onTextSelection?;
}

export default function MonacoCodeEditor({
  language,
  label = "",
  value,
  theme = "vs-dark",
  startingLineNumber = 0,
  height = "400px",
  stopLineNumberAt,
  options,
  onChange = () => {},
  setLanguageOptions = () => {},
  onTextSelection = () => {},
}: MonacoCodeEditorProps) {
  const editorRef = useRef(null);

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
    setLanguageOptions(
      languages.map(lang => ({
        label: lang.aliases?.[0] || lang.id,
        value: lang.id,
      }))
    );
  };

  const handleEditorMount: OnMount = editor => {
    editorRef.current = editor;

    // Optional: log on selection change
    editor.onDidChangeCursorSelection(e => {
      const { startLineNumber, startColumn, endLineNumber, endColumn } = e.selection;
      onTextSelection({
        start: { line: startLineNumber, col: startColumn },
        end: { line: endLineNumber, col: endColumn },
      });
      const selectedText = editor.getModel()?.getValueInRange(e.selection);
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
            lineNumbers: i => (i >= stopLineNumberAt ? "" : `${i + startingLineNumber}`),
            lineNumbersMinChars: 2,
            lineDecorationsWidth: 0,
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
