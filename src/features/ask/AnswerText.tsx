import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Claude's text is shown as formatting only: no raw HTML, and no images it could pull in. */
export function AnswerText({ text }: { text: string }) {
  return (
    <div className="answer-text">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        disallowedElements={["img"]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
