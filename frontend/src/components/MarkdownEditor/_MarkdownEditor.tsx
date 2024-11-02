import { Box, Typography } from "@mui/material";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBlockquote,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonCode,
  MenuButtonCodeBlock,
  MenuButtonEditLink,
  MenuButtonHorizontalRule,
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
  RichTextEditor,
} from "mui-tiptap";
import { memo, useRef } from "react";

function _MarkdownEditor(props: { oldValue?: string; onChange?: (x: string) => void }) {
  const { oldValue } = props;
  const ref = useRef(null);
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
        extensions={[StarterKit, Underline, Subscript, Superscript]}
        renderControls={() => (
          <MenuControlsContainer>
            <MenuButtonUndo />
            <MenuButtonRedo />
            <MenuButtonRemoveFormatting />
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
            <MenuDivider />
            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuButtonCode />
            <MenuButtonCodeBlock />
            <MenuButtonHorizontalRule />
          </MenuControlsContainer>
        )}
      />
    </Box>
  );
}

export default memo(_MarkdownEditor, () => true);
