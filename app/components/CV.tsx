import React from "react";
import style from "../components/CV.module.scss";
type CVProps = {
  GPTResponse: string;
};

export default function CV({ GPTResponse }: CVProps) {
  return (
    <div>
      <p>Response from LLM:</p>
      <div className={style["gpt-response"]}>{GPTResponse}</div>
    </div>
  );
}
