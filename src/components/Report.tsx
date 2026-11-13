import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Isi laporan berasal dari halaman web, jadi HTML mentah TIDAK dirender
// (react-markdown mengabaikannya secara default). Link dibuka di tab baru.
export function Report({ markdown }: { markdown: string }) {
  return (
    <div className="report">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
