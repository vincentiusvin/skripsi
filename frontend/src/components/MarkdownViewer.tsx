import Markdown from "react-markdown";

function MarkdownViewer(props: { children: string }) {
  const { children } = props;
  return <Markdown skipHtml>{children}</Markdown>;
}

export default MarkdownViewer;
