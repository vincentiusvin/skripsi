import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertImage,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  StrikeThroughSupSubToggles,
  UndoRedo,
  diffSourcePlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { memo } from "react";
import { fileToBase64DataURL } from "../../helpers/file.ts";

function _MarkdownEditor(props: { oldValue?: string; onChange?: (x: string) => void }) {
  const { oldValue, onChange } = props;
  const theme = useTheme();
  return (
    <Box
      sx={{
        border: "1px solid",
        borderRadius: "8px",
        position: "relative",
        borderColor: (theme) =>
          theme.palette.mode === "light" ? "rgba(0, 0, 0, 0.23)" : "rgba(255, 255, 255, 0.23)",
        margin: "1px",
        "&:hover": {
          borderColor: (theme) => theme.palette.text.primary,
        },
        "&:focus-within": {
          borderColor: (theme) => theme.palette.primary.main,
          borderWidth: 2,
          margin: "0px",
        },
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
        zIndex={3}
        sx={{
          transform: "translate(8px, -11px)",
          top: 0,
          background: "#212225",
          pointerEvents: "none",
          paddingX: 1,
        }}
        className="markdown-editor-label-custom"
        variant="caption"
      >
        Penjelasan Proyek
      </Typography>
      <MDXEditor
        className={theme.palette.mode === "dark" ? "dark-theme custom-editor" : "custom-editor"}
        markdown={oldValue ?? ""}
        onChange={onChange}
        plugins={[
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
                <>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <Separator />
                  <StrikeThroughSupSubToggles />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <CreateLink />
                  <InsertImage />
                  <Separator />
                  <InsertThematicBreak />
                  <BlockTypeSelect />
                </>
              </DiffSourceToggleWrapper>
            ),
          }),
          listsPlugin(),
          quotePlugin(),
          headingsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin({
            imageUploadHandler: async (x) => {
              return await fileToBase64DataURL(x);
            },
          }),
          thematicBreakPlugin(),
          diffSourcePlugin({ viewMode: "rich-text" }),
          markdownShortcutPlugin(),
        ]}
      ></MDXEditor>
    </Box>
  );
}

export default memo(_MarkdownEditor, () => true);
