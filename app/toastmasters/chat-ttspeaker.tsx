// import React, { useState, useRef, useEffect } from "react";

// import { useChatStore } from "../store";

// import styles from "../components/chat.module.scss";
// import { List, showToast } from "../components/ui-lib";

// import {
//   ToastmastersTTSpeakerGuidance as ToastmastersRoleGuidance,
//   ToastmastersTTSpeaker as ToastmastersRoleOptions,
//   ToastmastersRolePrompt,
//   InputSubmitStatus,
// } from "./roles";
// import {
//   ChatTitle,
//   ChatInput,
//   ChatInputSubmit,
//   ChatResponse,
//   useScrollToBottom,
// } from "./chat-common";

// export function Chat() {
//   const [session, sessionIndex] = useChatStore((state) => [
//     state.currentSession(),
//     state.currentSessionIndex,
//   ]);

//   const inputRef = useRef<HTMLTextAreaElement>(null);

//   const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
//   const [hitBottom, setHitBottom] = useState(true);

//   const [toastmastersEvaluators, setToastmastersEvaluators] = useState<
//     ToastmastersRolePrompt[]
//   >([]);

//   // 进来时, 读取上次的输入
//   useEffect(() => {
//     var roles = session.inputs.roles?.map(
//       (index: number) => ToastmastersRoleOptions[index],
//     );
//     setToastmastersEvaluators(roles);
//   }, [session]);

//   const checkInput = (): InputSubmitStatus => {
//     const question = session.inputs.input.text;

//     if (question.trim() === "") {
//       showToast("Topic can not be empty");
//       return new InputSubmitStatus(false, "");
//     }

//     // Add a return statement for the case where the input is valid
//     var guidance = ToastmastersRoleGuidance(question);
//     return new InputSubmitStatus(true, guidance);
//   };

//   return (
//     <div className={styles.chat} key={session.id}>
//       <ChatTitle></ChatTitle>

//       <div
//         className={styles["chat-body"]}
//         ref={scrollRef}
//         onMouseDown={() => inputRef.current?.blur()}
//         onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
//         onTouchStart={() => {
//           inputRef.current?.blur();
//           setAutoScroll(false);
//         }}
//       >
//         <List>
//           <ChatInput title="Topic" inputStore={session.inputs.input} />

//           <ChatInputSubmit
//             roleOptions={ToastmastersRoleOptions}
//             selectedValues={toastmastersEvaluators}
//             updateParent={setToastmastersEvaluators}
//             checkInput={checkInput}
//           />

//           <ChatResponse
//             scrollRef={scrollRef}
//             toastmastersRolePrompts={toastmastersEvaluators}
//           />
//         </List>
//       </div>
//     </div>
//   );
// }

// // TODO: Merge into ttevaluator.tsx

export function Chat() {
  return <div>TODO</div>;
}
