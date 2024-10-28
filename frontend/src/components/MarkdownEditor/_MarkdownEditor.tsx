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
import { useTheme } from "@mui/material/styles";
import { fileToBase64DataURL } from "../../helpers/file.ts";

function _MarkdownEditor(props: { oldValue?: string; onChange?: (x: string) => void }) {
  const { oldValue, onChange } = props;
  const theme = useTheme();
  return (
    <MDXEditor
      className={theme.palette.mode === "dark" ? "dark-theme" : undefined}
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
  );
}

export default _MarkdownEditor;
