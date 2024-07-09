import chatStyles from "@/app/components/chat.module.scss";
import styles from "@/app/components/sd.module.scss";
import { IconButton } from "@/app/components/button";
import ReturnIcon from "@/app/icons/return.svg";
import Locale from "@/app/locales";
import { Path, StoreKey } from "@/app/constant";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  copyToClipboard,
  getMessageTextContent,
  useMobileScreen,
} from "@/app/utils";
import { useNavigate } from "react-router-dom";
import { useAppConfig } from "@/app/store";
import MinIcon from "@/app/icons/min.svg";
import MaxIcon from "@/app/icons/max.svg";
import { getClientConfig } from "@/app/config/client";
import { ChatAction } from "@/app/components/chat";
import DeleteIcon from "@/app/icons/clear.svg";
import CopyIcon from "@/app/icons/copy.svg";
import PromptIcon from "@/app/icons/prompt.svg";
import ResetIcon from "@/app/icons/reload.svg";
import { useIndexedDB } from "react-indexed-db-hook";
import { sendSdTask, useSdStore } from "@/app/store/sd";
import locales from "@/app/locales";
import LoadingIcon from "../icons/three-dots.svg";
import ErrorIcon from "../icons/delete.svg";
import { Property } from "csstype";
import {
  showConfirm,
  showImageModal,
  showModal,
} from "@/app/components/ui-lib";

function getBase64ImgUrl(base64Data: string, contentType: string) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });
  return URL.createObjectURL(blob);
}

function getSdTaskStatus(item: any) {
  let s: string;
  let color: Property.Color | undefined = undefined;
  switch (item.status) {
    case "success":
      s = Locale.Sd.Status.Success;
      color = "green";
      break;
    case "error":
      s = Locale.Sd.Status.Error;
      color = "red";
      break;
    case "wait":
      s = Locale.Sd.Status.Wait;
      color = "yellow";
      break;
    case "running":
      s = Locale.Sd.Status.Running;
      color = "blue";
      break;
    default:
      s = item.status.toUpperCase();
  }
  return (
    <p className={styles["line-1"]} title={item.error} style={{ color: color }}>
      <span>
        {locales.Sd.Status.Name}: {s}
      </span>
      {item.status === "error" && (
        <span
          className="clickable"
          onClick={() => {
            showModal({
              title: locales.Sd.Detail,
              children: (
                <div style={{ color: color, userSelect: "text" }}>
                  {item.error}
                </div>
              ),
            });
          }}
        >
          {" "}
          - {item.error}
        </span>
      )}
    </p>
  );
}

export function Sd() {
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();
  const clientConfig = useMemo(() => getClientConfig(), []);
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;
  const config = useAppConfig();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sdListDb = useIndexedDB(StoreKey.SdList);
  const [sdImages, setSdImages] = useState([]);
  const { execCount, execCountInc } = useSdStore();

  useEffect(() => {
    sdListDb.getAll().then((data) => {
      setSdImages(((data as never[]) || []).reverse());
    });
  }, [execCount]);

  return (
    <div className={chatStyles.chat} key={"1"}>
      <div className="window-header" data-tauri-drag-region>
        {isMobileScreen && (
          <div className="window-actions">
            <div className={"window-action-button"}>
              <IconButton
                icon={<ReturnIcon />}
                bordered
                title={Locale.Chat.Actions.ChatList}
                onClick={() => navigate(Path.SdPanel)}
              />
            </div>
          </div>
        )}
        <div className={`window-header-title ${chatStyles["chat-body-title"]}`}>
          <div className={`window-header-main-title`}>Stability AI</div>
          <div className="window-header-sub-title">
            {Locale.Sd.SubTitle(sdImages.length || 0)}
          </div>
        </div>

        <div className="window-actions">
          {showMaxIcon && (
            <div className="window-action-button">
              <IconButton
                icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
                bordered
                onClick={() => {
                  config.update(
                    (config) => (config.tightBorder = !config.tightBorder),
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
      <div className={chatStyles["chat-body"]} ref={scrollRef}>
        <div className={styles["sd-img-list"]}>
          {sdImages.length > 0 ? (
            sdImages.map((item: any) => {
              return (
                <div
                  key={item.id}
                  style={{ display: "flex" }}
                  className={styles["sd-img-item"]}
                >
                  {item.status === "success" ? (
                    <img
                      className={styles["img"]}
                      src={`data:image/png;base64,${item.img_data}`}
                      alt={`${item.id}`}
                      onClick={(e) => {
                        showImageModal(
                          getBase64ImgUrl(item.img_data, "image/png"),
                          true,
                        );
                      }}
                    />
                  ) : item.status === "error" ? (
                    <div className={styles["pre-img"]}>
                      <ErrorIcon />
                    </div>
                  ) : (
                    <div className={styles["pre-img"]}>
                      <LoadingIcon />
                    </div>
                  )}
                  <div
                    style={{ marginLeft: "10px" }}
                    className={styles["sd-img-item-info"]}
                  >
                    <p className={styles["line-1"]}>
                      {locales.SdPanel.Prompt}:{" "}
                      <span
                        className="clickable"
                        title={item.params.prompt}
                        onClick={() => {
                          showModal({
                            title: locales.Sd.Detail,
                            children: (
                              <div style={{ userSelect: "text" }}>
                                {item.params.prompt}
                              </div>
                            ),
                          });
                        }}
                      >
                        {item.params.prompt}
                      </span>
                    </p>
                    <p>
                      {locales.SdPanel.AIModel}: {item.model_name}
                    </p>
                    {getSdTaskStatus(item)}
                    <p>{item.created_at}</p>
                    <div className={chatStyles["chat-message-actions"]}>
                      <div className={chatStyles["chat-input-actions"]}>
                        <ChatAction
                          text={Locale.Sd.Actions.Params}
                          icon={<PromptIcon />}
                          onClick={() => {
                            showModal({
                              title: locales.Sd.GenerateParams,
                              children: (
                                <div style={{ userSelect: "text" }}>
                                  {Object.keys(item.params).map((key) => (
                                    <div key={key} style={{ margin: "10px" }}>
                                      <strong>{key}: </strong>
                                      {item.params[key]}
                                    </div>
                                  ))}
                                </div>
                              ),
                            });
                          }}
                        />
                        <ChatAction
                          text={Locale.Sd.Actions.Copy}
                          icon={<CopyIcon />}
                          onClick={() =>
                            copyToClipboard(
                              getMessageTextContent({
                                role: "user",
                                content: item.params.prompt,
                              }),
                            )
                          }
                        />
                        <ChatAction
                          text={Locale.Sd.Actions.Retry}
                          icon={<ResetIcon />}
                          onClick={() => {
                            const reqData = {
                              model: item.model,
                              model_name: item.model_name,
                              status: "wait",
                              params: { ...item.params },
                              created_at: new Date().toLocaleString(),
                              img_data: "",
                            };
                            sendSdTask(reqData, sdListDb, execCountInc);
                          }}
                        />
                        <ChatAction
                          text={Locale.Sd.Actions.Delete}
                          icon={<DeleteIcon />}
                          onClick={async () => {
                            if (await showConfirm(Locale.Sd.Danger.Delete)) {
                              sdListDb.deleteRecord(item.id).then(
                                () => {
                                  setSdImages(
                                    sdImages.filter(
                                      (i: any) => i.id !== item.id,
                                    ),
                                  );
                                },
                                (error) => {
                                  console.error(error);
                                },
                              );
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div>{locales.Sd.EmptyRecord}</div>
          )}
        </div>
      </div>
    </div>
  );
}
