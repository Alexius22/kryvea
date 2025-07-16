import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { useRef } from "react";

export default function MonacoCodeEditor({
  value = "",
  onChange = x => {},
  language,
  height = "400px",
  theme = "vs-dark",
  setLanguageOptions,
}) {
  const editorRef = useRef(null);

  const handleEditorWillMount = (monaco: Monaco) => {
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
      console.log("Cursor selection changed:", e);
      const selectedText = editor.getModel()?.getValueInRange(e.selection);
      console.log("Text selected:\n", selectedText);
    });

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
      beforeMount={handleEditorWillMount}
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
      }}
    />
  );
}
