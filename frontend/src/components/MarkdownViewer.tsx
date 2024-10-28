import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownViewer(props: { children: string }) {
  const { children } = props;
  return (
    <Markdown skipHtml urlTransform={(x) => x} remarkPlugins={[remarkGfm]}>
      {children}
    </Markdown>
  );
}

export default MarkdownViewer;
