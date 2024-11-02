import { Skeleton } from "@mui/material";
import { Suspense, lazy } from "react";

const LazyLoadRichEditor = lazy(() => import("./_RichEditor.tsx"));

function RichEditor(props: Parameters<typeof LazyLoadRichEditor>[0]) {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyLoadRichEditor {...props} />
    </Suspense>
  );
}

export default RichEditor;
