import Image from "next/image";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "@/app/components/mask.module.scss";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import LeftIcon from "@/app/icons/left.svg";
import { Path } from "@/app/constant";
export function RewardPage() {
  const navigate = useNavigate();

  return (
    <div style={{ height: "100%" }}>
      <div className={styles["new-chat"]}>
        <div className={styles["mask-header"]} style={{ padding: "10px" }}>
          <IconButton
            icon={<LeftIcon />}
            text={Locale.NewChat.Return}
            onClick={() => navigate(Path.Home)}
          ></IconButton>
        </div>
      </div>
      <div
        style={{ position: "relative", width: "100%", paddingBottom: "100%" }}
      >
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Image
            src="https://cos.xiaosi.cc/img/zanshang.jpeg"
            alt="打赏"
            layout="fill"
            objectFit="cover" // Optional: you can use this if you want the image to cover the entire area without stretching
          />
        </div>
      </div>
    </div>
  );
}
