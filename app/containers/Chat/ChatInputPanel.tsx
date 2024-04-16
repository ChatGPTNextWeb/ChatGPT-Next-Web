import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import useUploadImage from "@/app/hooks/useUploadImage";
import { IconButton } from "@/app/components/button";
import Locale from "@/app/locales";

import useSubmitHandler from "@/app/hooks/useSubmitHandler";
import { CHAT_PAGE_SIZE, LAST_INPUT_KEY, Path } from "@/app/constant";
import { ChatCommandPrefix, useChatCommand } from "@/app/command";
import { useChatStore } from "@/app/store/chat";
import { usePromptStore } from "@/app/store/prompt";
import { useAppConfig } from "@/app/store/config";
import useScrollToBottom from "@/app/hooks/useScrollToBottom";
import usePaste from "@/app/hooks/usePaste";

import { ChatActions } from "./ChatActions";
import PromptHints, { RenderPompt } from "./PromptHint";

import SendWhiteIcon from "@/app/icons/send-white.svg";
import DeleteIcon from "@/app/icons/clear.svg";

import styles from "./index.module.scss";

export interface ChatInputPanelProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  isMobileScreen: boolean;
  renderMessages: any[];
  attachImages: string[];
  userInput: string;
  hitBottom: boolean;
  inputRows: number;
  setAttachImages: (imgs: string[]) => void;
  setUserInput: (v: string) => void;
  setIsLoading: (value: boolean) => void;
  setShowPromptModal: (value: boolean) => void;
  _setMsgRenderIndex: (value: number) => void;
  showModelSelector: (value: boolean) => void;
}

export interface ChatInputPanelInstance {
  setUploading: (v: boolean) => void;
  doSubmit: (userInput: string) => void;
  setAutoScroll: (v: boolean) => void;
  setMsgRenderIndex: (v: number) => void;
}

export function DeleteImageButton(props: { deleteImage: () => void }) {
  return (
    <div className={styles["delete-image"]} onClick={props.deleteImage}>
      <DeleteIcon />
    </div>
  );
}

// only search prompts when user input is short
const SEARCH_TEXT_LIMIT = 30;

export default forwardRef<ChatInputPanelInstance, ChatInputPanelProps>(
  function ChatInputPanel(props, ref) {
    const {
      attachImages,
      inputRef,
      setAttachImages,
      userInput,
      isMobileScreen,
      setUserInput,
      setIsLoading,
      setShowPromptModal,
      renderMessages,
      scrollRef,
      _setMsgRenderIndex,
      hitBottom,
      inputRows,
      showModelSelector,
    } = props;

    const [uploading, setUploading] = useState(false);
    const [promptHints, setPromptHints] = useState<RenderPompt[]>([]);

    const chatStore = useChatStore();
    const navigate = useNavigate();
    const config = useAppConfig();

    const { uploadImage } = useUploadImage(attachImages, {
      emitImages: setAttachImages,
      setUploading,
    });
    const { submitKey, shouldSubmit } = useSubmitHandler();

    const autoFocus = !isMobileScreen; // wont auto focus on mobile screen

    const isScrolledToBottom = scrollRef?.current
      ? Math.abs(
          scrollRef.current.scrollHeight -
            (scrollRef.current.scrollTop + scrollRef.current.clientHeight),
        ) <= 1
      : false;

    const { setAutoScroll, scrollDomToBottom } = useScrollToBottom(
      scrollRef,
      isScrolledToBottom,
    );

    // chat commands shortcuts
    const chatCommands = useChatCommand({
      new: () => chatStore.newSession(),
      newm: () => navigate(Path.NewChat),
      prev: () => chatStore.nextSession(-1),
      next: () => chatStore.nextSession(1),
      clear: () =>
        chatStore.updateCurrentSession(
          (session) => (session.clearContextIndex = session.messages.length),
        ),
      del: () => chatStore.deleteSession(chatStore.currentSessionIndex),
    });

    // prompt hints
    const promptStore = usePromptStore();
    const onSearch = useDebouncedCallback(
      (text: string) => {
        const matchedPrompts = promptStore.search(text);
        setPromptHints(matchedPrompts);
      },
      100,
      { leading: true, trailing: true },
    );

    // check if should send message
    const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // if ArrowUp and no userInput, fill with last input
      if (
        e.key === "ArrowUp" &&
        userInput.length <= 0 &&
        !(e.metaKey || e.altKey || e.ctrlKey)
      ) {
        setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
        e.preventDefault();
        return;
      }
      if (shouldSubmit(e) && promptHints.length === 0) {
        doSubmit(userInput);
        e.preventDefault();
      }
    };

    const onPromptSelect = (prompt: RenderPompt) => {
      setTimeout(() => {
        setPromptHints([]);

        const matchedChatCommand = chatCommands.match(prompt.content);
        if (matchedChatCommand.matched) {
          // if user is selecting a chat command, just trigger it
          matchedChatCommand.invoke();
          setUserInput("");
        } else {
          // or fill the prompt
          setUserInput(prompt.content);
        }
        inputRef.current?.focus();
      }, 30);
    };

    const doSubmit = (userInput: string) => {
      if (userInput.trim() === "") return;
      const matchCommand = chatCommands.match(userInput);
      if (matchCommand.matched) {
        setUserInput("");
        setPromptHints([]);
        matchCommand.invoke();
        return;
      }
      setIsLoading(true);
      chatStore
        .onUserInput(userInput, attachImages)
        .then(() => setIsLoading(false));
      setAttachImages([]);
      localStorage.setItem(LAST_INPUT_KEY, userInput);
      setUserInput("");
      setPromptHints([]);
      if (!isMobileScreen) inputRef.current?.focus();
      setAutoScroll(true);
    };

    useImperativeHandle(ref, () => ({
      setUploading,
      doSubmit,
      setAutoScroll,
      setMsgRenderIndex,
    }));

    const onInput = (text: string) => {
      setUserInput(text);
      const n = text.trim().length;

      // clear search results
      if (n === 0) {
        setPromptHints([]);
      } else if (text.startsWith(ChatCommandPrefix)) {
        setPromptHints(chatCommands.search(text));
      } else if (!config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
        // check if need to trigger auto completion
        if (text.startsWith("/")) {
          let searchText = text.slice(1);
          onSearch(searchText);
        }
      }
    };

    function setMsgRenderIndex(newIndex: number) {
      newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
      newIndex = Math.max(0, newIndex);
      _setMsgRenderIndex(newIndex);
    }

    function scrollToBottom() {
      setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
      scrollDomToBottom();
    }

    const { handlePaste } = usePaste(attachImages, {
      emitImages: setAttachImages,
      setUploading,
    });

    let inputClassName = " flex flex-col px-5 pb-5";
    let actionsClassName = "py-2.5";
    let inputTextAreaClassName = "";

    if (isMobileScreen) {
      inputClassName = "flex flex-row-reverse items-center gap-2 p-3";
      actionsClassName = "";
      inputTextAreaClassName = "";
    }

    return (
      <div
        className={`relative w-[100%] box-border border-gray-200 border-t-[1px]`}
      >
        <PromptHints
          prompts={promptHints}
          onPromptSelect={onPromptSelect}
          className=""
        />

        <div className={`${inputClassName}`}>
          <ChatActions
            showModelSelector={showModelSelector}
            uploadImage={uploadImage}
            setAttachImages={setAttachImages}
            setUploading={setUploading}
            showPromptModal={() => setShowPromptModal(true)}
            scrollToBottom={scrollToBottom}
            hitBottom={hitBottom}
            uploading={uploading}
            showPromptHints={() => {
              // Click again to close
              if (promptHints.length > 0) {
                setPromptHints([]);
                return;
              }

              inputRef.current?.focus();
              setUserInput("/");
              onSearch("");
            }}
            className={actionsClassName}
            isMobileScreen={isMobileScreen}
          />
          <label
            className={`${styles["chat-input-panel-inner"]} ${
              attachImages.length != 0
                ? styles["chat-input-panel-inner-attach"]
                : ""
            } ${inputTextAreaClassName}`}
            htmlFor="chat-input"
          >
            <textarea
              id="chat-input"
              ref={inputRef}
              className={styles["chat-input"]}
              placeholder={Locale.Chat.Input(submitKey)}
              onInput={(e) => onInput(e.currentTarget.value)}
              value={userInput}
              onKeyDown={onInputKeyDown}
              onFocus={scrollToBottom}
              onClick={scrollToBottom}
              onPaste={handlePaste}
              rows={inputRows}
              autoFocus={autoFocus}
              style={{
                fontSize: config.fontSize,
              }}
            />
            {attachImages.length != 0 && (
              <div className={styles["attach-images"]}>
                {attachImages.map((image, index) => {
                  return (
                    <div
                      key={index}
                      className={styles["attach-image"]}
                      style={{ backgroundImage: `url("${image}")` }}
                    >
                      <div className={styles["attach-image-mask"]}>
                        <DeleteImageButton
                          deleteImage={() => {
                            setAttachImages(
                              attachImages.filter((_, i) => i !== index),
                            );
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <IconButton
              icon={<SendWhiteIcon />}
              text={Locale.Chat.Send}
              className={styles["chat-input-send"]}
              type="primary"
              onClick={() => doSubmit(userInput)}
            />
          </label>
        </div>
      </div>
    );
  },
);
