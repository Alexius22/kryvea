import "./rich_text.scss";

import {
  mdiCodeBraces,
  mdiCodeTags,
  mdiFormatAlignCenter,
  mdiFormatAlignJustify,
  mdiFormatAlignLeft,
  mdiFormatAlignRight,
  mdiFormatBold,
  mdiFormatColorHighlight,
  mdiFormatColorText,
  mdiFormatHeader1,
  mdiFormatHeader2,
  mdiFormatHeader3,
  mdiFormatHeader4,
  mdiFormatHeader5,
  mdiFormatHeader6,
  mdiFormatItalic,
  mdiFormatListBulleted,
  mdiFormatListNumbered,
  mdiFormatParagraph,
  mdiFormatQuoteClose,
  mdiFormatStrikethrough,
  mdiFormatUnderline,
  mdiImage,
  mdiLink,
  mdiLinkOff,
  mdiRedo,
  mdiTable,
  mdiTableColumnPlusBefore,
  mdiTableColumnRemove,
  mdiTablePlus,
  mdiTableRemove,
  mdiTableRowPlusAfter,
  mdiTableRowRemove,
  mdiUndo,
} from "@mdi/js";
import Color from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import Card from "../CardBox/Card";
import Modal from "../Composition/Modal";
import Button from "../Form/Button";
import ColorPicker from "../Form/ColorPicker";
import Input from "../Form/Input";

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
  }),
  Placeholder.configure({ placeholder: "Start typing..." }),
  TextStyle,
  Color,
  Image,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

const headingIcons = {
  1: mdiFormatHeader1,
  2: mdiFormatHeader2,
  3: mdiFormatHeader3,
  4: mdiFormatHeader4,
  5: mdiFormatHeader5,
  6: mdiFormatHeader6,
};

function MenuBar({ editor }: { editor: Editor | null }) {
  const [, setState] = useState(0);

  const [showModal, setShowModal] = useState<false | "link" | "image">(false);
  const [inputValue, setInputValue] = useState("");

  if (!editor) return null;

  editor.on("transaction", () => setState(v => v + 1));

  const is = (name: string, attrs?: any) => editor.isActive(name, attrs);
  const can = (command: () => boolean) => command();
  const isAlign = (value: "left" | "center" | "right" | "justify") => {
    const paraAlign = editor.getAttributes("paragraph")?.textAlign;
    const headingAlign = editor.getAttributes("heading")?.textAlign;

    const effective = paraAlign ?? headingAlign ?? "left";
    return effective === value;
  };

  const handleModalConfirm = () => {
    if (showModal === "link") {
      editor.chain().focus().extendMarkRange("link").setLink({ href: inputValue }).run();
    } else if (showModal === "image") {
      editor.chain().focus().setImage({ src: inputValue }).run();
    }
    setShowModal(false);
  };

  return (
    <>
      <Modal
        title={showModal === "link" ? "Insert Link" : "Insert Image"}
        isActive={!!showModal}
        onConfirm={handleModalConfirm}
        onCancel={() => setShowModal(false)}
      >
        {(showModal === "link" || showModal === "image") && (
          <Input
            type="text"
            label={showModal === "link" ? "URL" : "Image URL"}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            autoFocus
          />
        )}
      </Modal>

      <div className="RichText-buttons" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {/** Formatting Buttons */}
        <Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!can(() => editor.can().chain().focus().toggleBold().run())}
          className={is("bold") ? "" : "secondary"}
          icon={mdiFormatBold}
          title="Bold"
        />
        <Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!can(() => editor.can().chain().focus().toggleItalic().run())}
          className={is("italic") ? "" : "secondary"}
          icon={mdiFormatItalic}
          title="Italic"
        />
        <Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!can(() => editor.can().chain().focus().toggleUnderline().run())}
          className={is("underline") ? "" : "secondary"}
          icon={mdiFormatUnderline}
          title="Underline"
        />
        <Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!can(() => editor.can().chain().focus().toggleStrike().run())}
          className={is("strike") ? "" : "secondary"}
          icon={mdiFormatStrikethrough}
          title="Strikethrough"
        />
        <Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!can(() => editor.can().chain().focus().toggleCode().run())}
          className={is("code") ? "" : "secondary"}
          icon={mdiCodeBraces}
          title="Code"
        />
        <Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={!can(() => editor.can().chain().focus().toggleCodeBlock().run())}
          className={is("codeBlock") ? "" : "secondary"}
          icon={mdiCodeTags}
          title="Code Block"
        />

        {/** Heading Buttons */}
        {([1, 2, 3, 4, 5, 6] as const).map(level => (
          <Button
            key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
            disabled={!can(() => editor.can().chain().focus().toggleHeading({ level }).run())}
            className={is("heading", { level }) ? "" : "secondary"}
            icon={headingIcons[level]}
            title={`Heading ${level}`}
          />
        ))}

        <Button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={is("paragraph") ? "" : "secondary"}
          icon={mdiFormatParagraph}
          title="Paragraph"
        />

        {/** Alignment */}
        <Button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={!can(() => editor.can().chain().focus().setTextAlign("left").run())}
          className={isAlign("left") ? "" : "secondary"}
          icon={mdiFormatAlignLeft}
          title="Align Left"
        />

        <Button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={!can(() => editor.can().chain().focus().setTextAlign("center").run())}
          className={isAlign("center") ? "" : "secondary"}
          icon={mdiFormatAlignCenter}
          title="Align Center"
        />

        <Button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={!can(() => editor.can().chain().focus().setTextAlign("right").run())}
          className={isAlign("right") ? "" : "secondary"}
          icon={mdiFormatAlignRight}
          title="Align Right"
        />

        <Button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          disabled={!can(() => editor.can().chain().focus().setTextAlign("justify").run())}
          className={isAlign("justify") ? "" : "secondary"}
          icon={mdiFormatAlignJustify}
          title="Justify"
        />

        {/** Lists */}
        <Button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={!can(() => editor.can().chain().focus().toggleBulletList().run())}
          className={is("bulletList") ? "" : "secondary"}
          icon={mdiFormatListBulleted}
          title="Bullet List"
        />
        <Button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={!can(() => editor.can().chain().focus().toggleOrderedList().run())}
          className={is("orderedList") ? "" : "secondary"}
          icon={mdiFormatListNumbered}
          title="Ordered List"
        />

        {/** Quote */}
        <Button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={!can(() => editor.can().chain().focus().toggleBlockquote().run())}
          className={is("blockquote") ? "" : "secondary"}
          icon={mdiFormatQuoteClose}
          title="Blockquote"
        />

        {/* Link buttons */}
        {!is("link") ? (
          <Button
            icon={mdiLink}
            title="Add Link"
            onClick={() => {
              setInputValue("https://");
              setShowModal("link");
            }}
          />
        ) : (
          <Button icon={mdiLinkOff} title="Remove Link" onClick={() => editor.chain().focus().unsetLink().run()} />
        )}

        {/* Image button */}
        <Button
          onClick={() => {
            setInputValue("https://via.placeholder.com/150");
            setShowModal("image");
          }}
          disabled={!can(() => editor.can().chain().focus().setImage({ src: "https://via.placeholder.com/150" }).run())}
          icon={mdiImage}
          title="Insert Image"
        />

        {/** Table */}
        <Button
          icon={mdiTable}
          title="Insert Table"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <Button
          icon={mdiTablePlus}
          title="Add Column After"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        />
        <Button
          icon={mdiTableColumnPlusBefore}
          title="Add Column Before"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        />
        <Button
          icon={mdiTableColumnRemove}
          title="Delete Column"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        />
        <Button
          icon={mdiTableRowPlusAfter}
          title="Add Row After"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        />
        <Button icon={mdiTableRowRemove} title="Delete Row" onClick={() => editor.chain().focus().deleteRow().run()} />
        <Button icon={mdiTableRemove} title="Delete Table" onClick={() => editor.chain().focus().deleteTable().run()} />

        {/** Colors */}
        <ColorPicker
          icon={mdiFormatColorText}
          title="Text Color"
          value={editor.getAttributes("textStyle").color || "#000000"}
          onChange={color => {
            editor.chain().focus().setColor(color).run();
          }}
        />

        <ColorPicker
          icon={mdiFormatColorHighlight}
          title="Highlight"
          value={editor.getAttributes("highlight").color}
          onChange={color => {
            editor.chain().focus().setHighlight({ color }).run();
          }}
        />

        {/** Undo / Redo */}
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!can(() => editor.can().undo())}
          icon={mdiUndo}
          title="Undo"
        />
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!can(() => editor.can().redo())}
          icon={mdiRedo}
          title="Redo"
        />
      </div>
    </>
  );
}

export default function RichTextEditor() {
  const editor = useEditor({
    extensions,
  });

  return (
    <Card className="RichText">
      <MenuBar editor={editor} />
      <EditorContent className="RichText-editor-content" editor={editor} />
    </Card>
  );
}
