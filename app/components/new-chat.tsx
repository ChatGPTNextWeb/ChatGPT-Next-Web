import { useEffect, useRef, useState } from "react";
import { Path, SlotID } from "../constant";
import { IconButton } from "./button";
import { EmojiAvatar } from "./emoji";
import styles from "./new-chat.module.scss";

import LeftIcon from "../icons/left.svg";
import AddIcon from "../icons/lightning.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { createEmptyMask, Mask, useMaskStore } from "../store/mask";
import Locale from "../locales";
import { useAppConfig, useChatStore } from "../store";
import { MaskAvatar } from "./mask";

function getIntersectionArea(aRect: DOMRect, bRect: DOMRect) {
  const xmin = Math.max(aRect.x, bRect.x);
  const xmax = Math.min(aRect.x + aRect.width, bRect.x + bRect.width);
  const ymin = Math.max(aRect.y, bRect.y);
  const ymax = Math.min(aRect.y + aRect.height, bRect.y + bRect.height);
  const width = xmax - xmin;
  const height = ymax - ymin;
  const intersectionArea = width < 0 || height < 0 ? 0 : width * height;
  return intersectionArea;
}

function MaskItem(props: { mask: Mask; onClick?: () => void }) {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const changeOpacity = () => {
      const dom = domRef.current;
      const parent = document.getElementById(SlotID.AppBody);
      if (!parent || !dom) return;

      const domRect = dom.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      const intersectionArea = getIntersectionArea(domRect, parentRect);
      const domArea = domRect.width * domRect.height;
      const ratio = intersectionArea / domArea;
      const opacity = ratio > 0.9 ? 1 : 0.4;
      dom.style.opacity = opacity.toString();
    };

    setTimeout(changeOpacity, 30);

    window.addEventListener("resize", changeOpacity);

    return () => window.removeEventListener("resize", changeOpacity);
  }, [domRef]);

  return (
    <div className={styles["mask"]} ref={domRef} onClick={props.onClick}>
      <MaskAvatar mask={props.mask} />
      <div className={styles["mask-name"] + " one-line"}>{props.mask.name}</div>
    </div>
  );
}

function useMaskGroup(masks: Mask[]) {
  const [groups, setGroups] = useState<Mask[][]>([]);

  useEffect(() => {
    const appBody = document.getElementById(SlotID.AppBody);
    if (!appBody || masks.length === 0) return;

    const rect = appBody.getBoundingClientRect();
    const maxWidth = rect.width;
    const maxHeight = rect.height * 0.6;
    const maskItemWidth = 120;
    const maskItemHeight = 50;

    const randomMask = () => masks[Math.floor(Math.random() * masks.length)];
    let maskIndex = 0;
    const nextMask = () => masks[maskIndex++ % masks.length];

    const rows = Math.ceil(maxHeight / maskItemHeight);
    const cols = Math.ceil(maxWidth / maskItemWidth);

    const newGroups = new Array(rows)
      .fill(0)
      .map((_, _i) =>
        new Array(cols)
          .fill(0)
          .map((_, j) => (j < 1 || j > cols - 2 ? randomMask() : nextMask())),
      );

    setGroups(newGroups);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return groups;
}

export function NewChat() {
  const chatStore = useChatStore();
  const maskStore = useMaskStore();

  const masks = maskStore.getAll();
  const groups = useMaskGroup(masks);

  const navigate = useNavigate();
  const config = useAppConfig();

  const { state } = useLocation();

  const startChat = (mask?: Mask) => {
    chatStore.newSession(mask);
    navigate(Path.Chat);
  };

  return (
    <div className={styles["new-chat"]}>
      <div className={styles["mask-header"]}>
        <IconButton
          icon={<LeftIcon />}
          text={Locale.NewChat.Return}
          onClick={() => navigate(Path.Home)}
        ></IconButton>
        {!state?.fromHome && (
          <IconButton
            text={Locale.NewChat.NotShow}
            onClick={() => {
              if (confirm(Locale.NewChat.ConfirmNoShow)) {
                startChat();
                config.update(
                  (config) => (config.dontShowMaskSplashScreen = true),
                );
              }
            }}
          ></IconButton>
        )}
      </div>
      <div className={styles["mask-cards"]}>
        <div className={styles["mask-card"]}>
          <EmojiAvatar avatar="1f606" size={24} />
        </div>
        <div className={styles["mask-card"]}>
          <EmojiAvatar avatar="1f916" size={24} />
        </div>
        <div className={styles["mask-card"]}>
          <EmojiAvatar avatar="1f479" size={24} />
        </div>
      </div>

      <div className={styles["title"]}>{Locale.NewChat.Title}</div>
      <div className={styles["sub-title"]}>{Locale.NewChat.SubTitle}</div>

      <div className={styles["actions"]}>
        <input
          className={styles["search-bar"]}
          placeholder={Locale.NewChat.More}
          type="text"
          onClick={() => navigate(Path.Masks)}
        />

        <IconButton
          text={Locale.NewChat.Skip}
          onClick={() => startChat()}
          icon={<AddIcon />}
          type="primary"
          shadow
        />
      </div>

      <div className={styles["masks"]}>
        {groups.map((masks, i) => (
          <div key={i} className={styles["mask-row"]}>
            {masks.map((mask, index) => (
              <MaskItem
                key={index}
                mask={mask}
                onClick={() => startChat(mask)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
