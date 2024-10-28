import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MarkdownTextViewer(props: { children: string }) {
  const { children } = props;
  return (
    <Markdown skipHtml remarkPlugins={[remarkGfm]}>
      {children}
    </Markdown>
  );
}

export default MarkdownTextViewer;
