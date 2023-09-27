import "cherry-markdown/dist/cherry-markdown.css";
import { default as CherryEngine } from "cherry-markdown/dist/cherry-markdown.engine.core";
import { useEffect, useRef } from "react";
import React from "react";

const CherryCoreMarkdown: React.FC<{ content: string }> = (props) => {
  const id = useRef(Math.random().toString(36).substring(7));
  const ref = useRef<HTMLDivElement>(null);
  const instance = useRef<CherryEngine["engine"] | null>(
    new CherryEngine({ id: id.current }) as any as CherryEngine["engine"],
  );
  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = instance.current?.makeHtml(props.content) || "";
  }, [props.content]);
  return <div ref={ref} />;
};

export default React.memo(CherryCoreMarkdown);
