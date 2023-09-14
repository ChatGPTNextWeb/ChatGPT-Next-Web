import {
  ChatMessage,
  createMessage,
  useAppConfig,
  useChatStore,
} from "../store";
import Locale from "../locales";
import styles from "../components/exporter.module.scss";
import { List, ListItem, Modal, Select, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import { copyToClipboard, downloadAs, useMobileScreen } from "../utils";

import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import ChatGptIcon from "../icons/chatgpt.png";
import ShareIcon from "../icons/share.svg";
import BotIcon from "../icons/bot.png";

import DownloadIcon from "../icons/download.svg";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSelector,
  useMessageSelector,
} from "../components/message-selector";
import { Avatar } from "../components/emoji";
import dynamic from "next/dynamic";
import NextImage from "next/image";

import { toBlob, toJpeg, toPng } from "html-to-image";
import { DEFAULT_MASK_AVATAR } from "../store/mask";
import { api } from "../client/api";
import { prettyObject } from "../utils/format";
import { EXPORT_MESSAGE_CLASS_NAME, AppInfo } from "../constant";
import {
  Markdown,
  useSteps,
  Steps,
  PreviewActions,
} from "../components/exporter";

export function ExportMessageModal(props: {
  onClose: () => void;
  messages: ChatMessage[];
  topic: string;
}) {
  return (
    <div className="modal-mask">
      <Modal title={Locale.Export.Title} onClose={props.onClose}>
        <div style={{ minHeight: "40vh" }}>
          <MessageExporter messages={props.messages} topic={props.topic} />
        </div>
      </Modal>
    </div>
  );
}

export function MessageExporter(props: {
  messages: ChatMessage[];
  topic: string;
}) {
  const steps = [
    {
      name: Locale.Export.Steps.Select,
      value: "select",
    },
    {
      name: Locale.Export.Steps.Preview,
      value: "preview",
    },
  ];
  const { currentStep, setCurrentStepIndex, currentStepIndex } =
    useSteps(steps);
  const formats = ["text", "image"] as const;
  type ExportFormat = (typeof formats)[number];

  const [exportConfig, setExportConfig] = useState({
    format: "image" as ExportFormat,
    includeContext: false, // always false
  });

  function updateExportConfig(updater: (config: typeof exportConfig) => void) {
    const config = { ...exportConfig };
    updater(config);
    setExportConfig(config);
  }

  return (
    <>
      <Steps
        steps={steps}
        index={currentStepIndex}
        onStepChange={setCurrentStepIndex}
      />
      <div
        className={styles["message-exporter-body"]}
        style={currentStep.value !== "select" ? { display: "none" } : {}}
      >
        <List>
          <ListItem
            title={Locale.Export.Format.Title}
            subTitle={Locale.Export.Format.SubTitle}
          >
            <Select
              value={exportConfig.format}
              onChange={(e) =>
                updateExportConfig(
                  (config) =>
                    (config.format = e.currentTarget.value as ExportFormat),
                )
              }
            >
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </ListItem>
        </List>
      </div>
      {currentStep.value === "preview" && (
        <div className={styles["message-exporter-body"]}>
          {exportConfig.format === "text" ? (
            <MarkdownPreviewer messages={props.messages} topic={props.topic} />
          ) : (
            <ImagePreviewer messages={props.messages} topic={props.topic} />
          )}
        </div>
      )}
    </>
  );
}

function ExportAvatar(props: { avatar: string }) {
  if (props.avatar === DEFAULT_MASK_AVATAR) {
    return (
      <NextImage
        src={BotIcon.src}
        width={30}
        height={30}
        alt="bot"
        className="user-avatar"
      />
    );
  }

  return <Avatar avatar={props.avatar}></Avatar>;
}

export function ImagePreviewer(props: {
  messages: ChatMessage[];
  topic: string;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const mask = session.mask;
  const config = useAppConfig();

  const previewRef = useRef<HTMLDivElement>(null);

  const copy = () => {
    const dom = previewRef.current;
    if (!dom) return;
    toBlob(dom).then((blob) => {
      if (!blob) return;
      try {
        navigator.clipboard
          .write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ])
          .then(() => {
            showToast(Locale.Copy.Success);
          });
      } catch (e) {
        console.error("[Copy Image] ", e);
        showToast(Locale.Copy.Failed);
      }
    });
  };

  const isMobile = useMobileScreen();

  const download = () => {
    const dom = previewRef.current;
    if (!dom) return;
    toPng(dom)
      .then((blob) => {
        if (!blob) return;

        if (isMobile) {
          const image = new Image();
          image.src = blob;
          const win = window.open("");
          win?.document.write(image.outerHTML);
        } else {
          const link = document.createElement("a");
          link.download = `${props.topic}.png`;
          link.href = blob;
          link.click();
        }
      })
      .catch((e) => console.log("[Export Image] ", e));
  };

  return (
    <div className={styles["image-previewer"]}>
      <PreviewActions
        copy={copy}
        download={download}
        showCopy={!isMobile}
        messages={props.messages}
      />
      <div
        className={`${styles["preview-body"]} ${styles["default-theme"]}`}
        ref={previewRef}
      >
        <div className={styles["chat-info"]}>
          {/* <div className={styles["logo"] + " no-dark"}>
            <NextImage
              src={ChatGptIcon.src}
              alt="logo"
              width={50}
              height={50}
            />
          </div> */}

          <div>
            <div className={styles["main-title"]}>{AppInfo.Title}</div>
            <div className={styles["sub-title"]}>{AppInfo.Url}</div>
            <div className={styles["icons"]}>
              <ExportAvatar avatar={config.avatar} />
              <span className={styles["icon-space"]}>&</span>
              <ExportAvatar avatar={mask.avatar} />
            </div>
          </div>
          <div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Model}: {mask.modelConfig.model}
            </div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Messages}: {props.messages.length}
            </div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Topic}: {session.topic}
            </div>
            <div className={styles["chat-info-item"]}>
              {Locale.Exporter.Time}:{" "}
              {new Date(
                props.messages.at(-1)?.date ?? Date.now(),
              ).toLocaleString()}
            </div>
          </div>
        </div>
        {props.messages.map((m, i) => {
          return (
            <div className={styles["message-column"]} key={i}>
              <div className={styles["avatar-row"]}>{m.title}</div>

              <div className={styles["body"]}>
                <Markdown
                  content={m.content}
                  fontSize={config.fontSize}
                  defaultShow
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarkdownPreviewer(props: {
  messages: ChatMessage[];
  topic: string;
}) {
  const mdText =
    `# ${props.topic}\n\n` +
    props.messages
      .map((m) => {
        return m.role === "user"
          ? `## ${m.title}:\n${m.content}`
          : `## ${m.title}:\n${m.content.trim()}`;
      })
      .join("\n\n");

  const copy = () => {
    copyToClipboard(mdText);
  };
  const download = () => {
    downloadAs(mdText, `${props.topic}.md`);
  };

  return (
    <>
      <PreviewActions
        copy={copy}
        download={download}
        messages={props.messages}
      />
      <div className="markdown-body">
        <pre className={styles["export-content"]}>{mdText}</pre>
      </div>
    </>
  );
}
