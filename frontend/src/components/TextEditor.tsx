import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";

function MilkdownEditor() {
  useEditor((root) => {
    const c = new Crepe({ root });
    return c.editor;
  });

  return <Milkdown />;
}

function TextEditor() {
  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
}

export default TextEditor;
