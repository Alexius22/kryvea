import "./rich_text.scss";

import { TextStyleKit } from "@tiptap/extension-text-style";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Card from "../CardBox/Card";
import Button from "../Form/Button";

const extensions = [TextStyleKit, StarterKit];

function MenuBar({ editor }: { editor: Editor }) {
  // Read the current editor's state, and re-render the component when it changes
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      return {
        isBold: ctx.editor.isActive("bold"),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive("italic"),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor.isActive("strike"),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor.isActive("code"),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
        isParagraph: ctx.editor.isActive("paragraph"),
        isHeading1: ctx.editor.isActive("heading", { level: 1 }),
        isHeading2: ctx.editor.isActive("heading", { level: 2 }),
        isHeading3: ctx.editor.isActive("heading", { level: 3 }),
        isHeading4: ctx.editor.isActive("heading", { level: 4 }),
        isHeading5: ctx.editor.isActive("heading", { level: 5 }),
        isHeading6: ctx.editor.isActive("heading", { level: 6 }),
        isBulletList: ctx.editor.isActive("bulletList"),
        isOrderedList: ctx.editor.isActive("orderedList"),
        isCodeBlock: ctx.editor.isActive("codeBlock"),
        isBlockquote: ctx.editor.isActive("blockquote"),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      };
    },
  });

  return (
    <div className="RichText-buttons">
      <Button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editorState.canBold}
        className={editorState.isBold ? "" : "secondary"}
        text="Bold"
      />
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editorState.canItalic}
        variant={editorState.isItalic ? "" : "secondary"}
        text="Italic"
      />
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editorState.canStrike}
        className={editorState.isStrike ? "" : "secondary"}
        text="Strike"
      />
      <Button
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editorState.canCode}
        className={editorState.isCode ? "" : "secondary"}
        text="Code"
      />
      <Button onClick={() => editor.chain().focus().unsetAllMarks().run()} text="Clear marks" />
      <Button onClick={() => editor.chain().focus().clearNodes().run()} text="Clear nodes" />
      <Button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editorState.isParagraph ? "" : "secondary"}
        text="Paragraph"
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editorState.isHeading1 ? "" : "secondary"}
        text="H1"
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editorState.isHeading2 ? "" : "secondary"}
        text="H2"
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editorState.isHeading3 ? "" : "secondary"}
        text="H3"
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editorState.isHeading4 ? "" : "secondary"}
        text="H4"
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editorState.isHeading5 ? "" : "secondary"}
        text="H5"
      />
      <Button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editorState.isHeading6 ? "" : "secondary"}
        text="H6"
      />
      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editorState.isBulletList ? "" : "secondary"}
        text="Bullet list"
      />
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editorState.isOrderedList ? "" : "secondary"}
        text="Ordered list"
      />
      <Button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editorState.isCodeBlock ? "" : "secondary"}
        text="Code block"
      />
      <Button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editorState.isBlockquote ? "" : "secondary"}
        text="Blockquote"
      />
      <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} text="Horizontal rule" />
      <Button onClick={() => editor.chain().focus().setHardBreak().run()} text="Hard break" />
      <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} text="Undo" />
      <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} text="Redo" />
    </div>
  );
}

export default () => {
  const editor = useEditor({
    extensions,
    content: `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That’s a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
</p>
<blockquote>
  Wow, that’s amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`,
  });
  return (
    <Card className="RichText">
      <MenuBar editor={editor} />
      <EditorContent className="RichText-editor-content" editor={editor} />
    </Card>
  );
};
