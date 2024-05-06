import { useEffect, useRef, useState } from "react";
import { Prompt } from "@/app/store/prompt";

import styles from "../index.module.scss";
import useShowPromptHint from "@/app/hooks/useShowPromptHint";

export type RenderPompt = Pick<Prompt, "title" | "content">;

export default function PromptHints(props: {
  prompts: RenderPompt[];
  onPromptSelect: (prompt: RenderPompt) => void;
  className?: string;
}) {
  const noPrompts = props.prompts.length === 0;

  const [selectIndex, setSelectIndex] = useState(0);

  const selectedRef = useRef<HTMLDivElement>(null);

  const { internalPrompts, notShowPrompt } = useShowPromptHint({ ...props });

  useEffect(() => {
    setSelectIndex(0);
  }, [props.prompts.length]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (noPrompts || e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      // arrow up / down to select prompt
      const changeIndex = (delta: number) => {
        e.stopPropagation();
        e.preventDefault();
        const nextIndex = Math.max(
          0,
          Math.min(props.prompts.length - 1, selectIndex + delta),
        );
        setSelectIndex(nextIndex);
        selectedRef.current?.scrollIntoView({
          block: "center",
        });
      };

      if (e.key === "ArrowUp") {
        changeIndex(1);
      } else if (e.key === "ArrowDown") {
        changeIndex(-1);
      } else if (e.key === "Enter") {
        const selectedPrompt = props.prompts.at(selectIndex);
        if (selectedPrompt) {
          props.onPromptSelect(selectedPrompt);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.prompts.length, selectIndex]);

  if (!internalPrompts.length) {
    return null;
  }

  return (
    <div
      className={`
        transition-all duration-300 shadow-prompt-hint-container rounded-none  flex flex-col-reverse overflow-x-hidden
        ${
          notShowPrompt
            ? "max-h-[0vh] border-none"
            : "border-b pt-2.5 max-h-[50vh]"
        } 
        ${props.className}
      `}
    >
      {internalPrompts.map((prompt, i) => (
        <div
          ref={i === selectIndex ? selectedRef : null}
          className={
            styles["prompt-hint"] +
            ` ${i === selectIndex ? styles["prompt-hint-selected"] : ""}`
          }
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
          onMouseEnter={() => setSelectIndex(i)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}
