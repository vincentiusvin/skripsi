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

function MarkdownTest() {
  const theme = useTheme();
  return (
    <MDXEditor
      className={theme.palette.mode === "dark" ? "dark-theme" : undefined}
      markdown="hi"
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
        imagePlugin({ imageUploadHandler: async () => "sample-image.png" }),
        thematicBreakPlugin(),
        diffSourcePlugin({ viewMode: "rich-text" }),
        markdownShortcutPlugin(),
      ]}
    ></MDXEditor>
  );
}

export default MarkdownTest;
