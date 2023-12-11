import { useState } from "react";
import { Input, List, ListItem, Modal, showConfirm } from "./ui-lib";
import { IconButton } from "./button";
import Locale, { getLang } from "../locales";
import useFileUploader, { Options } from "../utils/files/hooks/useFileUploader";

import UploadIcon from "../icons/upload.svg";
import StopIcon from "../icons/pause.svg";
import LoadingIcon from "../icons/three-dots.svg";
import SendWhiteIcon from "../icons/send-white.svg";
import ResetIcon from "../icons/reload.svg";

interface FileParseSettingsProps {
  children?: React.ReactNode;
  chunkSize: number;
  onChunkSizeChange: (chunkSize: string) => void;
  overlapSize: number;
  onOverlapSizeChange: (overlapSize: string) => void;
  basePrompt: string;
  onBasePromptChange: (prompt: string) => void;
  singleFilePrompt: string;
  onSingleFilePromptChange: (prompt: string) => void;
  multipleFilesPrompt: string;
  onMultipleFilesPromptChange: (prompt: string) => void;
  multipleFilesUpPrompt: string;
  onMultipleFilesUpPromptChange: (prompt: string) => void;
  lastPartPrompt: string;
  onLastPartPromptChange: (prompt: string) => void;
  blacklist: string[];
  ignoreExtensions: string[];
  setBlacklist: (blacklist: string[]) => void;
  setIgnoreExtensions: (ignoreExtensions: string[]) => void;
  updateBlackListAndIgnoreExtensions: () => void;
  onUploadButtonClick: () => void;
}

interface ContextInputItemProps {
  title: string;
  subTitle?: string;
  content: string;
  update: (content: string) => void;
  remove?: () => void;
}

function ContextInputItem(props: ContextInputItemProps) {
  const [focusingInput, setFocusingInput] = useState(false);

  return (
    <ListItem title={props.title} subTitle={props.subTitle}>
      <Input
        type="text"
        value={props.content}
        rows={focusingInput ? 5 : 1}
        onFocus={() => setFocusingInput(true)}
        onBlur={() => {
          setFocusingInput(false);
          window?.getSelection()?.removeAllRanges();
        }}
        onInput={(e) => props.update(e.currentTarget.value as any)}
      ></Input>
    </ListItem>
  );
}

function FileParseSettings({
  chunkSize,
  onChunkSizeChange,
  onBasePromptChange,
  onSingleFilePromptChange,
  onMultipleFilesPromptChange,
  onMultipleFilesUpPromptChange,
  onLastPartPromptChange,
  basePrompt,
  singleFilePrompt,
  multipleFilesPrompt,
  lastPartPrompt,
  multipleFilesUpPrompt,
  onOverlapSizeChange,
  overlapSize,

  children,
}: FileParseSettingsProps) {
  return (
    <>
      {children}
      <List>
        <ListItem
          title={Locale.Chat.FileUploadActions.Settings.General.ChunkSize.Title}
          subTitle={
            Locale.Chat.FileUploadActions.Settings.General.ChunkSize.SubTitle
          }
        >
          <input
            type="number"
            min={1000}
            max={20000}
            value={chunkSize}
            onChange={(e) => onChunkSizeChange(e.target.value)}
          ></input>
        </ListItem>
        <ListItem
          title={
            Locale.Chat.FileUploadActions.Settings.General.OverlapSize.Title
          }
          subTitle={
            Locale.Chat.FileUploadActions.Settings.General.OverlapSize.SubTitle
          }
        >
          <input
            type="number"
            value={overlapSize}
            onChange={(e) => onOverlapSizeChange(e.target.value)}
          ></input>
        </ListItem>
      </List>
      <List>
        {(
          [
            {
              title:
                Locale.Chat.FileUploadActions.Settings.Prompt.BasePrompt.Title,
              subTitle:
                Locale.Chat.FileUploadActions.Settings.Prompt.BasePrompt
                  .SubTitle,
              content: basePrompt,
              update: (value) => {
                onBasePromptChange(value);
              },
            },
            {
              title:
                Locale.Chat.FileUploadActions.Settings.Prompt.SinglePartPrompt
                  .Title,
              subTitle:
                Locale.Chat.FileUploadActions.Settings.Prompt.SinglePartPrompt
                  .SubTitle,
              content: singleFilePrompt,
              update: (value) => {
                onSingleFilePromptChange(value);
              },
            },
            {
              title:
                Locale.Chat.FileUploadActions.Settings.Prompt
                  .MultiPartFirstPrompt.Title,
              subTitle:
                Locale.Chat.FileUploadActions.Settings.Prompt
                  .MultiPartFirstPrompt.SubTitle,
              content: multipleFilesPrompt,
              update: (value) => {
                onMultipleFilesPromptChange(value);
              },
            },
            {
              title:
                Locale.Chat.FileUploadActions.Settings.Prompt
                  .MultiPartConsecutivePrompts.Title,
              subTitle:
                Locale.Chat.FileUploadActions.Settings.Prompt
                  .MultiPartConsecutivePrompts.SubTitle,
              content: multipleFilesUpPrompt,
              update: (value) => {
                onMultipleFilesUpPromptChange(value);
              },
            },
            {
              title:
                Locale.Chat.FileUploadActions.Settings.Prompt.LastPartPrompt
                  .Title,
              subTitle:
                Locale.Chat.FileUploadActions.Settings.Prompt.LastPartPrompt
                  .SubTitle,
              content: lastPartPrompt,
              update: (value) => {
                onLastPartPromptChange(value);
              },
            },
          ] as ContextInputItemProps[]
        ).map(({ title, subTitle, content, update }) => (
          <ContextInputItem
            key={title}
            title={title}
            subTitle={subTitle}
            content={content}
            update={update}
          />
        ))}
      </List>
    </>
  );
}

export function FileParseToast(props: {
  showModal?: boolean;
  doSubmit: (message: string) => void;
  setShowModal: (_: boolean) => void;
}) {
  const onSubmitConversation: Options["onSubmitConversation"] = async (
    value,
    context,
  ) => {
    const isStart = context?.currentPart === 1;
    if (isStart) {
      if (
        await showConfirm(
          Locale.Chat.FileUploadActions.SendConfirm(context?.totalParts),
        )
      ) {
        props.doSubmit(value);
      } else {
        return Promise.reject();
      }
    } else {
      props.doSubmit(value);
    }
  };
  const {
    isSubmitting,
    isParseing,
    setIsStopRequested,
    onUploadButtonClick,
    currentPart,
    totalParts,
    fileName,
    chunkSize,
    onChunkSizeChange,
    basePrompt,
    singleFilePrompt,
    multipleFilesPrompt,
    lastPartPrompt,
    onBasePromptChange,
    onSingleFilePromptChange,
    onMultipleFilesPromptChange,
    onMultipleFilesUpPromptChange,
    onLastPartPromptChange,
    blacklist,
    ignoreExtensions,
    setBlacklist,
    setIgnoreExtensions,
    updateBlackListAndIgnoreExtensions,
    multipleFilesUpPrompt,
    overlapSize,
    onOverlapSizeChange,
    doReset,
    sendMessage,
    conversationWithPromptList,
  } = useFileUploader({
    lang: getLang(),
    onSubmitConversation,
  });
  const onClose = () => {
    props.setShowModal(false);
  };
  return (
    <>
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title={Locale.Chat.FileUploadActions.Title}
            onClose={onClose}
            actions={[
              <IconButton
                key="reset"
                icon={<ResetIcon />}
                bordered
                text={Locale.Chat.FileUploadActions.Reset}
                onClick={async () => {
                  if (
                    await showConfirm(Locale.Chat.FileUploadActions.ResetConfim)
                  ) {
                    doReset();
                  }
                }}
              />,
              <IconButton
                key="send"
                type="primary"
                icon={<SendWhiteIcon />}
                bordered
                text={Locale.Chat.Send}
                disabled={isParseing}
                onClick={() => {
                  if (!isSubmitting && !isParseing) {
                    try {
                      sendMessage();
                      onClose();
                    } catch (error) {
                      console.error(error);
                    }
                  }
                }}
              />,
            ]}
          >
            <FileParseSettings
              onChunkSizeChange={onChunkSizeChange}
              chunkSize={chunkSize}
              overlapSize={overlapSize}
              onOverlapSizeChange={onOverlapSizeChange}
              basePrompt={basePrompt}
              singleFilePrompt={singleFilePrompt}
              multipleFilesPrompt={multipleFilesPrompt}
              lastPartPrompt={lastPartPrompt}
              multipleFilesUpPrompt={multipleFilesUpPrompt}
              onBasePromptChange={onBasePromptChange}
              onSingleFilePromptChange={onSingleFilePromptChange}
              onMultipleFilesPromptChange={onMultipleFilesPromptChange}
              onMultipleFilesUpPromptChange={onMultipleFilesUpPromptChange}
              onLastPartPromptChange={onLastPartPromptChange}
              blacklist={blacklist}
              ignoreExtensions={ignoreExtensions}
              setBlacklist={setBlacklist}
              setIgnoreExtensions={setIgnoreExtensions}
              updateBlackListAndIgnoreExtensions={
                updateBlackListAndIgnoreExtensions
              }
              onUploadButtonClick={() => {
                onUploadButtonClick();
              }}
            >
              <List>
                <ListItem
                  title={Locale.Chat.InputActions.FileUpload}
                  subTitle={fileName}
                >
                  {isSubmitting ? (
                    <IconButton
                      icon={<StopIcon />}
                      text={
                        Locale.Chat.Actions.Stop +
                        `(${currentPart}/${totalParts})`
                      }
                      bordered
                      onClick={() => {
                        setIsStopRequested(true);
                      }}
                    />
                  ) : isParseing ? (
                    <IconButton icon={<LoadingIcon />} bordered />
                  ) : (
                    <IconButton
                      icon={<UploadIcon />}
                      text={Locale.UI.Import}
                      bordered
                      onClick={() => {
                        onUploadButtonClick();
                      }}
                    />
                  )}
                </ListItem>
              </List>
            </FileParseSettings>
          </Modal>
        </div>
      )}
    </>
  );
}
