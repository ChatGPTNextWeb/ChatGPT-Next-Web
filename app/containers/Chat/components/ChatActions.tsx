import { useNavigate } from "react-router-dom";

import { ModelType, Theme, useAppConfig } from "@/app/store/config";
import { useChatStore } from "@/app/store/chat";
import { ChatControllerPool } from "@/app/client/controller";
import { useAllModels } from "@/app/utils/hooks";
import { useEffect, useMemo, useState } from "react";
import { isVisionModel } from "@/app/utils";
import { showToast } from "@/app/components/ui-lib";
import Locale from "@/app/locales";
import { Path } from "@/app/constant";

import BottomIcon from "@/app/icons/bottom.svg";
import StopIcon from "@/app/icons/pause.svg";
import LoadingButtonIcon from "@/app/icons/loading.svg";
import PromptIcon from "@/app/icons/comandIcon.svg";
import MaskIcon from "@/app/icons/maskIcon.svg";
import BreakIcon from "@/app/icons/eraserIcon.svg";
import SettingsIcon from "@/app/icons/configIcon.svg";
import ImageIcon from "@/app/icons/uploadImgIcon.svg";
import AddCircleIcon from "@/app/icons/addCircle.svg";

import Popover from "@/app/components/Popover";
import ModelSelect from "./ModelSelect";

export interface Action {
  onClick?: () => void;
  text: string;
  isShow: boolean;
  render?: (key: string) => JSX.Element;
  icon?: JSX.Element;
  placement: "left" | "right";
  className?: string;
}

export function ChatActions(props: {
  uploadImage: () => void;
  setAttachImages: (images: string[]) => void;
  setUploading: (uploading: boolean) => void;
  showChatSetting: () => void;
  scrollToBottom: () => void;
  showPromptHints: () => void;
  hitBottom: boolean;
  uploading: boolean;
  isMobileScreen: boolean;
  className?: string;
}) {
  const config = useAppConfig();
  const navigate = useNavigate();
  const chatStore = useChatStore();

  // switch themes
  const theme = config.theme;
  function nextTheme() {
    const themes = [Theme.Auto, Theme.Light, Theme.Dark];
    const themeIndex = themes.indexOf(theme);
    const nextIndex = (themeIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    config.update((config) => (config.theme = nextTheme));
  }

  // stop all responses
  const couldStop = ChatControllerPool.hasPending();
  const stopAll = () => ChatControllerPool.stopAll();

  // switch model
  const currentModel = chatStore.currentSession().mask.modelConfig.model;
  const allModels = useAllModels();
  const models = useMemo(
    () => allModels.filter((m) => m.available),
    [allModels],
  );
  const [showUploadImage, setShowUploadImage] = useState(false);

  useEffect(() => {
    const show = isVisionModel(currentModel);
    setShowUploadImage(show);
    if (!show) {
      props.setAttachImages([]);
      props.setUploading(false);
    }

    // if current model is not available
    // switch to first available model
    const isUnavaliableModel = !models.some((m) => m.name === currentModel);
    if (isUnavaliableModel && models.length > 0) {
      const nextModel = models[0].name as ModelType;
      chatStore.updateCurrentSession(
        (session) => (session.mask.modelConfig.model = nextModel),
      );
      showToast(nextModel);
    }
  }, [chatStore, currentModel, models]);

  const actions: Action[] = [
    {
      onClick: stopAll,
      text: Locale.Chat.InputActions.Stop,
      isShow: couldStop,
      icon: <StopIcon />,
      placement: "left",
    },
    {
      text: currentModel,
      isShow: !props.isMobileScreen,
      render: (key: string) => <ModelSelect key={key} />,
      placement: "left",
    },
    {
      onClick: props.scrollToBottom,
      text: Locale.Chat.InputActions.ToBottom,
      isShow: !props.hitBottom,
      icon: <BottomIcon />,
      placement: "left",
    },
    {
      onClick: props.uploadImage,
      text: Locale.Chat.InputActions.UploadImage,
      isShow: showUploadImage,
      icon: props.uploading ? <LoadingButtonIcon /> : <ImageIcon />,
      placement: "left",
    },
    // {
    //   onClick: nextTheme,
    //   text: Locale.Chat.InputActions.Theme[theme],
    //   isShow: true,
    //   icon: (
    //     <>
    //       {theme === Theme.Auto ? (
    //         <AutoIcon />
    //       ) : theme === Theme.Light ? (
    //         <LightIcon />
    //       ) : theme === Theme.Dark ? (
    //         <DarkIcon />
    //       ) : null}
    //     </>
    //   ),
    //   placement: "left",
    // },
    {
      onClick: props.showPromptHints,
      text: Locale.Chat.InputActions.Prompt,
      isShow: true,
      icon: <PromptIcon />,
      placement: "left",
    },
    {
      onClick: () => {
        navigate(Path.Masks);
      },
      text: Locale.Chat.InputActions.Masks,
      isShow: true,
      icon: <MaskIcon />,
      placement: "left",
    },
    {
      onClick: () => {
        chatStore.updateCurrentSession((session) => {
          if (session.clearContextIndex === session.messages.length) {
            session.clearContextIndex = undefined;
          } else {
            session.clearContextIndex = session.messages.length;
            session.memoryPrompt = ""; // will clear memory
          }
        });
      },
      text: Locale.Chat.InputActions.Clear,
      isShow: true,
      icon: <BreakIcon />,
      placement: "right",
    },
    {
      onClick: props.showChatSetting,
      text: Locale.Chat.InputActions.Settings,
      isShow: true,
      icon: <SettingsIcon />,
      placement: "right",
    },
  ];

  if (props.isMobileScreen) {
    const content = (
      <div className="w-[100%]">
        {actions
          .filter((v) => v.isShow && v.icon)
          .map((act) => {
            return (
              <div
                key={act.text}
                className={`flex items-center gap-3 p-3 rounded-action-btn leading-6 cursor-pointer follow-parent-svg default-icon-color`}
                onClick={act.onClick}
              >
                {act.icon}
                <div className="flex-1 font-common text-actions-popover-menu-item">
                  {act.text}
                </div>
              </div>
            );
          })}
      </div>
    );
    return (
      <Popover
        content={content}
        trigger="click"
        placement="rt"
        noArrow
        popoverClassName="border border-chat-actions-popover-mobile rounded-md shadow-chat-actions-popover-mobile w-actions-popover bg-chat-actions-popover-panel-mobile "
        className=" cursor-pointer follow-parent-svg default-icon-color"
      >
        <AddCircleIcon />
      </Popover>
    );
  }

  const popoverClassName = `bg-chat-actions-btn-popover px-3 py-2.5 text-text-chat-actions-btn-popover text-sm-title rounded-md`;

  return (
    <div className={`flex gap-2 item-center ${props.className}`}>
      {actions
        .filter((v) => v.placement === "left" && v.isShow)
        .map((act, ind) => {
          if (act.render) {
            return (
              <div className={`${act.className ?? ""}`} key={act.text}>
                {act.render(act.text)}
              </div>
            );
          }
          return (
            <Popover
              key={act.text}
              content={act.text}
              popoverClassName={`${popoverClassName}`}
              placement={ind ? "t" : "lt"}
              className={`${act.className ?? ""}`}
            >
              <div
                className={` 
                  cursor-pointer h-[32px] w-[32px] flex items-center justify-center transition duration-300 ease-in-out 
                  hover:bg-chat-actions-btn-hovered hover:rounded-action-btn
                  follow-parent-svg default-icon-color
                `}
                onClick={act.onClick}
              >
                {act.icon}
              </div>
            </Popover>
          );
        })}
      <div className="flex-1"></div>
      {actions
        .filter((v) => v.placement === "right" && v.isShow)
        .map((act, ind, arr) => {
          return (
            <Popover
              key={act.text}
              content={act.text}
              popoverClassName={`${popoverClassName}`}
              placement={ind === arr.length - 1 ? "rt" : "t"}
            >
              <div
                className={`
                  cursor-pointer h-[32px] w-[32px] flex items-center transition duration-300 ease-in-out justify-center 
                  hover:bg-chat-actions-btn-hovered hover:rounded-action-btn
                  follow-parent-svg default-icon-color
                `}
                onClick={act.onClick}
              >
                {act.icon}
              </div>
            </Popover>
          );
        })}
    </div>
  );
}
