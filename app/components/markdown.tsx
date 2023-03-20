import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";
import RemarkGfm from 'remark-gfm'
import RehypePrsim from 'rehype-prism-plus'

export function Markdown(props: { content: string }) {
    return (
        <ReactMarkdown remarkPlugins={[RemarkMath, RemarkGfm]} rehypePlugins={[RehypeKatex, RehypePrsim]}>
            {props.content}
        </ReactMarkdown>
    );
}