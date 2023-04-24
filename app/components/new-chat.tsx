import { useEffect, useRef } from "react";
import { SlotID } from "../constant";
import { IconButton } from "./button";
import { EmojiAvatar } from "./emoji";
import styles from "./new-chat.module.scss";
import LeftIcon from "../icons/left.svg";
import { useNavigate } from "react-router-dom";

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

function Mask(props: { avatar: string; name: string }) {
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
    <div className={styles["mask"]} ref={domRef}>
      <div className={styles["mask-avatar"]}>
        <EmojiAvatar avatar={props.avatar} />
      </div>
      <div className={styles["mask-name"] + " one-line"}>{props.name}</div>
    </div>
  );
}

export function NewChat() {
  const masks = new Array(20).fill(0).map(() =>
    new Array(10).fill(0).map((_, i) => ({
      avatar: "1f" + (Math.round(Math.random() * 50) + 600).toString(),
      name: ["撩妹达人", "编程高手", "情感大师", "健康医生", "数码通"][
        Math.floor(Math.random() * 4)
      ],
    })),
  );

  const navigate = useNavigate();

  return (
    <div className={styles["new-chat"]}>
      <div className={styles["mask-header"]}>
        <IconButton
          icon={<LeftIcon />}
          text="返回"
          onClick={() => navigate(-1)}
        ></IconButton>
        <IconButton text="跳过"></IconButton>
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

      <div className={styles["title"]}>挑选一个面具</div>
      <div className={styles["sub-title"]}>
        现在开始，与面具背后的灵魂思维碰撞
      </div>

      <input className={styles["search-bar"]} placeholder="搜索" type="text" />

      <div className={styles["masks"]}>
        {masks.map((masks, i) => (
          <div key={i} className={styles["mask-row"]}>
            {masks.map((mask, index) => (
              <Mask key={index} {...mask} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
