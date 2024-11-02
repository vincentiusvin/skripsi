import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { LinkBubbleMenuHandler, ResizableImage, RichTextReadOnly } from "mui-tiptap";

function RichViewer(props: { children: string }) {
  const { children } = props;
  return (
    <RichTextReadOnly
      extensions={[
        StarterKit,
        Underline,
        Subscript,
        Superscript,
        Link,
        LinkBubbleMenuHandler,
        ResizableImage.configure({
          allowBase64: true,
        }),
      ]}
      content={children}
    />
  );
}

export default RichViewer;
