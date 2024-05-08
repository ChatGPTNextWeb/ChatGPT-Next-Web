import { forwardRef, useImperativeHandle, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import useUploadImage from "@/app/hooks/useUploadImage";
import Locale from "@/app/locales";

import useSubmitHandler from "@/app/hooks/useSubmitHandler";
import { CHAT_PAGE_SIZE, LAST_INPUT_KEY, Path } from "@/app/constant";
import { ChatCommandPrefix, useChatCommand } from "@/app/command";
import { useChatStore } from "@/app/store/chat";
import { usePromptStore } from "@/app/store/prompt";
import { useAppConfig } from "@/app/store/config";
import usePaste from "@/app/hooks/usePaste";

import { ChatActions } from "./ChatActions";
import PromptHints, { RenderPompt } from "./PromptHint";

// import CEIcon from "@/app/icons/command&enterIcon.svg";
// import EnterIcon from "@/app/icons/enterIcon.svg";
import SendIcon from "@/app/icons/sendIcon.svg";

import Btn from "@/app/components/Btn";
import Thumbnail from "@/app/components/ThumbnailImg";

export interface ChatInputPanelProps {
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
  showChatSetting: (value: boolean) => void;
  _setMsgRenderIndex: (value: number) => void;
  setAutoScroll: (value: boolean) => void;
  scrollDomToBottom: () => void;
}

export interface ChatInputPanelInstance {
  setUploading: (v: boolean) => void;
  doSubmit: (userInput: string) => void;
  setMsgRenderIndex: (v: number) => void;
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
      showChatSetting,
      renderMessages,
      _setMsgRenderIndex,
      hitBottom,
      inputRows,
      setAutoScroll,
      scrollDomToBottom,
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
      setMsgRenderIndex,
    }));

    function scrollToBottom() {
      setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
      scrollDomToBottom();
    }

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

    const { handlePaste } = usePaste(attachImages, {
      emitImages: setAttachImages,
      setUploading,
    });

    return (
      <div
        className={`
        relative w-[100%] box-border 
        max-md:rounded-tl-md max-md:rounded-tr-md
        md:border-t md:border-chat-input-top
      `}
      >
        <PromptHints
          prompts={promptHints}
          onPromptSelect={onPromptSelect}
          className=" border-chat-input-top"
        />

        <div
          className={`
            flex
            max-md:flex-row-reverse max-md:items-center max-md:gap-2 max-md:p-3
            md:flex-col md:px-5 md:pb-5
          `}
        >
          <ChatActions
            uploadImage={uploadImage}
            setAttachImages={setAttachImages}
            setUploading={setUploading}
            showChatSetting={() => showChatSetting(true)}
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
            className={`
              md:py-2.5
            `}
            isMobileScreen={isMobileScreen}
          />
          <label
            className={`
              cursor-text flex flex-col bg-chat-panel-input-hood border border-chat-input-hood 
              focus-within:border-chat-input-hood-focus sm:focus-within:shadow-chat-input-hood-focus-shadow 
              rounded-chat-input p-3 gap-3 max-md:flex-1
              md:rounded-md md:p-4 md:gap-4
            `}
            htmlFor="chat-input"
          >
            {attachImages.length != 0 && (
              <div className={`flex gap-2`}>
                {attachImages.map((image, index) => {
                  return (
                    <Thumbnail
                      key={index}
                      deleteImage={() => {
                        setAttachImages(
                          attachImages.filter((_, i) => i !== index),
                        );
                      }}
                      image={image}
                    />
                  );
                })}
              </div>
            )}
            <textarea
              id="chat-input"
              ref={inputRef}
              className={`
                leading-[19px] flex-1 focus:outline-none focus:shadow-none focus:border-none resize-none bg-inherit text-text-input
                max-md:h-chat-input-mobile
                md:min-h-chat-input
              `}
              placeholder={
                isMobileScreen
                  ? Locale.Chat.Input(submitKey, isMobileScreen)
                  : undefined
              }
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
            {!isMobileScreen && (
              <div className="flex items-center justify-center text-sm gap-3">
                <div className="flex-1">&nbsp;</div>
                <div className="text-text-chat-input-placeholder font-common line-clamp-1">
                  {Locale.Chat.Input(submitKey)}
                </div>
                <Btn
                  className="min-w-[77px]"
                  icon={<SendIcon />}
                  text={Locale.Chat.Send}
                  disabled={!userInput.length}
                  type="primary"
                  onClick={() => doSubmit(userInput)}
                />
              </div>
            )}
          </label>
        </div>
      </div>
    );
  },
);
