import { Box, Typography } from "@mui/material";
import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import {
  LinkBubbleMenu,
  LinkBubbleMenuHandler,
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHorizontalRule,
  MenuButtonImageUpload,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
  MenuButtonStrikethrough,
  MenuButtonSubscript,
  MenuButtonSuperscript,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  ResizableImage,
  RichTextEditor,
  RichTextEditorRef,
  insertImages,
} from "mui-tiptap";
import { memo, useRef } from "react";
import { fileToBase64DataURL } from "../../helpers/file.ts";

function _MarkdownEditor(props: { oldValue?: string; onChange?: (x: string) => void }) {
  const { oldValue } = props;
  const ref = useRef<RichTextEditorRef>(null);

  async function insertImage(files: File[], pos?: number) {
    if (ref.current?.editor == null) {
      return;
    }
    const images = await Promise.all(
      files.map(async (file) => ({
        src: await fileToBase64DataURL(file),
        alt: file.name,
      })),
    );

    insertImages({
      editor: ref.current.editor,
      images,
      position: pos,
    });
  }

  return (
    <Box
      sx={{
        position: "relative",
        ".markdown-editor-label-custom": {
          color: (theme) => theme.palette.text.secondary,
        },
        "&:focus-within .markdown-editor-label-custom": {
          color: (theme) => theme.palette.primary.main,
        },
      }}
    >
      <Typography
        position={"absolute"}
        component={"label"}
        zIndex={100}
        sx={{
          transform: "translate(8px, -11px)",
          top: 0,
          background: (theme) => theme.palette.background.default,
          pointerEvents: "none",
          paddingX: 1,
        }}
        className="markdown-editor-label-custom"
        variant="caption"
      >
        Penjelasan Proyek
      </Typography>
      <RichTextEditor
        content={oldValue}
        ref={ref}
        extensions={[
          StarterKit,
          Underline,
          Subscript,
          Superscript,
          Link,
          LinkBubbleMenuHandler,
          ResizableImage,
        ]}
        editorProps={{
          handleDrop: (view, event) => {
            if (!(event instanceof DragEvent) || !event.dataTransfer) {
              return false;
            }
            const files = Array.from(event.dataTransfer.files);
            const imgs = files.filter((x) => x.type.toLowerCase().startsWith("image/"));
            if (imgs.length) {
              const pos = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });
              insertImage(imgs, pos?.pos);
              return true;
            }
            return false;
          },
          handlePaste: (_, event) => {
            if (!event.clipboardData) {
              return false;
            }
            const files = Array.from(event.clipboardData.files);
            const imgs = files.filter((x) => x.type.toLowerCase().startsWith("image/"));
            if (imgs.length) {
              insertImage(imgs);
              return true;
            }
            return false;
          },
        }}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuButtonUndo />
            <MenuButtonRedo />
            <MenuDivider />
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonUnderline />
            <MenuButtonStrikethrough />
            <MenuButtonSubscript />
            <MenuButtonSuperscript />
            <MenuDivider />
            <MenuButtonEditLink />
            <MenuButtonImageUpload
              onUploadFiles={(files) =>
                Promise.all(
                  files.map(async (file) => ({
                    src: await fileToBase64DataURL(file),
                    alt: file.name,
                  })),
                )
              }
            />
            <MenuDivider />
            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuButtonCode />
            <MenuButtonCodeBlock />
            <MenuDivider />
            <MenuButtonHorizontalRule />
            <MenuButtonRemoveFormatting />
          </MenuControlsContainer>
        )}
      >
        {() => (
          <>
            <LinkBubbleMenu />
          </>
        )}
      </RichTextEditor>
    </Box>
  );
}

export default memo(_MarkdownEditor, () => true);
