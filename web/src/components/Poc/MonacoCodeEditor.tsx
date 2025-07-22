import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useRef } from "react";

export default function MonacoCodeEditor({
  value = "",
  onChange = x => {},
  language,
  height = "400px",
  theme = "vs-dark",
  setLanguageOptions = x => {},
  options = {} as monaco.editor.IStandaloneEditorConstructionOptions,
}) {
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
      const selectedText = editor.getModel()?.getValueInRange(e.selection);
    });

    editor
      .getAction("editor.action.formatDocument")
      .run()
      .finally(() => console.log("Document formatted"));
    // Optional: detect actual drag
    // editor.onMouseDown(e => {
    //   const disposable = editor.onMouseUp(() => {
    //     const selection = editor.getSelection();
    //     const selectedText = editor.getModel()?.getValueInRange(selection);
    //     console.log("Mouse drag selected text:", selectedText);
    //     disposable.dispose(); // Remove the one-time listener
    //   });
    // });
  };

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={theme}
      onChange={val => onChange(val || "")}
      beforeMount={handleBeforeMount}
      onMount={handleEditorMount}
      options={{
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
  );
}
