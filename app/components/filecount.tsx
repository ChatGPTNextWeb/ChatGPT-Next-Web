import { ChatMessage, useAppConfig, useChatStore } from "../store";
import Locale from "../locales";
import styles from "./exporter.module.scss";
import { List, ListItem, Modal, Select, showToast } from "./ui-lib";
import { IconButton } from "./button";
import { copyToClipboard, downloadAs, useMobileScreen } from "../utils";

import CopyIcon from "../icons/copy.svg";
import LoadingIcon from "../icons/three-dots.svg";
import ChatGptIcon from "../icons/chatgpt.png";
import ShareIcon from "../icons/share.svg";
import BotIcon from "../icons/bot.png";

import DownloadIcon from "../icons/download.svg";
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSelector, useMessageSelector } from "./message-selector";
import { Avatar } from "./emoji";
import dynamic from "next/dynamic";
import NextImage from "next/image";

import { toBlob, toJpeg, toPng } from "html-to-image";
import { DEFAULT_MASK_AVATAR } from "../store/mask";
import { api } from "../client/api";
import { prettyObject } from "../utils/format";
import { EXPORT_MESSAGE_CLASS_NAME } from "../constant";

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />,
});

export function ExportFileCountModel(props: { onClose: () => void }) {
  return (
    <div className="modal-mask">
      <Modal title={Locale.FileCount.Title} onClose={props.onClose}>
        <div style={{ minHeight: "40vh" }}>
          <FileExporter />
        </div>
      </Modal>
    </div>
  );
}

async function FetchFileCount(): Promise<string[]> {
  const testPath = "http://127.0.0.1:3001/api/fileCount";
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const uuid = session.id.toString();
  const testBody = {
    uuid: uuid,
  };
  const testPayload = {
    method: "POST",
    body: JSON.stringify(testBody),
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(testPath, testPayload);
  const data = await response.json();
  return data;
}

function FileExporter() {
  const [fileCount, setFileCount] = useState<string[]>([]);

  useEffect(() => {
    FetchFileCount()
      .then((data) => setFileCount(data))
      .catch((error) => {
        console.error("Error:", error);
        // 处理错误
      });
  }, []);

  return (
    <>
      {fileCount.map((file, index) => (
        <div key={index}>{file}</div>
      ))}
    </>
  );
}
