import { useEffect, useState } from "react";

export default function useShowPromptHint<RenderPompt>(props: {
  prompts: RenderPompt[];
}) {
  const [internalPrompts, setInternalPrompts] = useState<RenderPompt[]>([]);
  const [notShowPrompt, setNotShowPrompt] = useState(true);

  useEffect(() => {
    if (props.prompts.length !== 0) {
      setInternalPrompts(props.prompts);

      window.setTimeout(() => {
        setNotShowPrompt(false);
      }, 50);

      return;
    }
    setNotShowPrompt(true);
    window.setTimeout(() => {
      setInternalPrompts(props.prompts);
    }, 300);
  }, [props.prompts]);

  return {
    notShowPrompt,
    internalPrompts,
  };
}
