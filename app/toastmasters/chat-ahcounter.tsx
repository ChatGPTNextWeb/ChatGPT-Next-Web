import React, { useState, useRef, useEffect } from "react";

import { useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import styles_toastmasters from "./toastmasters.module.scss";
import { List, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import CollapsibleTable from "./chat-input-table";

import {
  ToastmastersAhCounterGuidance as ToastmastersRoleGuidance,
  ToastmastersAhCounter as ToastmastersRoleOptions,
  ToastmastersRolePrompt,
  InputSubmitStatus,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatInputSubmit,
  ChatResponse,
  useScrollToBottom,
  ChatInputName,
} from "./chat-common";
import { InputBlock } from "../store/chat";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import RenameIcon from "../icons/rename.svg";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const [toastmastersEvaluators, setToastmastersEvaluators] = useState<
    ToastmastersRolePrompt[]
  >([]);

  const [inputBlocks, setInputBlocks] = useState<InputBlock[]>([]);

  // 进来时, 读取上次的输入
  useEffect(() => {
    var roles = session.inputs.roles?.map(
      (index: number) => ToastmastersRoleOptions[index],
    );
    setToastmastersEvaluators(roles);

    setInputBlocks(session.inputBlocks ?? []);
  }, [session]);

  useEffect(() => {
    session.inputBlocks = inputBlocks;
  }, [inputBlocks, session]);

  const checkInput = (): InputSubmitStatus => {
    const question = session.inputs.input.text;
    const speech = session.inputs.input2.text;

    if (question.trim() === "") {
      showToast("Question can not be empty");
      return new InputSubmitStatus(false, "");
    }

    if (speech === "") {
      showToast("Speech can not be empty");
      return new InputSubmitStatus(false, "");
    }

    // Add a return statement for the case where the input is valid
    var guidance = ToastmastersRoleGuidance(question, speech);
    return new InputSubmitStatus(true, guidance);
  };

  const addItem = () => {
    const newItem: InputBlock = {
      key: inputBlocks.length + 1,
      speaker: `Speaker ${inputBlocks.length + 1}`,
    };
    setInputBlocks([...inputBlocks, newItem]);
  };
  const deleteItem = (key: number) => {
    const updatedItems = inputBlocks.filter((item) => item.key !== key);
    setInputBlocks(updatedItems);
  };
  const renameSpeaker = (item: InputBlock) => {
    showPrompt("Rename", item.speaker).then((newName) => {
      if (newName && newName !== item.speaker) {
        item.speaker = newName;
      }
    });
  };

  const getSpeaker = (item: InputBlock): string => {
    if (item.speaker === undefined) {
      item.speaker = `Speaker ${item.key}`;
    }
    return item.speaker;
  };

  return (
    <div className={styles.chat} key={session.id}>
      <ChatTitle></ChatTitle>
      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <button
          onClick={addItem}
          className={styles_toastmasters["chat-input-add-button"]}
        >
          Add Speaker
        </button>

        <CollapsibleTable />

        {session.inputBlocks.map((item, index) => (
          <List key={index}>
            <div className={styles_toastmasters["chat-input-group-actions-L0"]}>
              <div
                className={styles_toastmasters["chat-input-group-actions-L1"]}
              >
                <IconButton
                  icon={<CloseIcon />}
                  onClick={() => deleteItem(item.key)}
                />
                <IconButton icon={<DownloadIcon />} onClick={() => {}} />
                <IconButton icon={<UploadIcon />} onClick={() => {}} />
                <IconButton
                  icon={<RenameIcon />}
                  onClick={() => {
                    renameSpeaker(item);
                  }}
                />
              </div>
            </div>

            <div
              className={`${styles["chat-body-main-title"]}`}
              onClickCapture={() => {}}
            >
              {session.inputBlocks[index].speaker}
            </div>
            <ChatInput title="Question" inputStore={session.inputs.input} />
            <ChatInput
              title="Table Topics Speech"
              inputStore={session.inputs.input2}
            />
          </List>
        ))}

        <ChatInputSubmit
          roleOptions={ToastmastersRoleOptions}
          selectedValues={toastmastersEvaluators}
          updateParent={setToastmastersEvaluators}
          checkInput={checkInput}
        />

        <ChatResponse
          scrollRef={scrollRef}
          toastmastersRolePrompts={toastmastersEvaluators}
        />
      </div>
    </div>
  );
}
