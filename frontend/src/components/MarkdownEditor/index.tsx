import "@mdxeditor/editor/style.css";
import { Skeleton } from "@mui/material";
import { Suspense, lazy } from "react";

const LazyLoadMarkdownEditor = lazy(() => import("./_MarkdownEditor.tsx"));

function MarkdownEditor(props: Parameters<typeof LazyLoadMarkdownEditor>[0]) {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyLoadMarkdownEditor {...props} />
    </Suspense>
  );
}

export default MarkdownEditor;
