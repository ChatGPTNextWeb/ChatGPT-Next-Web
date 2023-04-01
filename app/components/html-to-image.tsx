import React, { useState, useEffect } from "react";
import { toJpeg } from "html-to-image";
import LoadingIcon from "../icons/three-dots.svg";
import styles from "./html-to-image.module.scss";

export function HtmlToImage(props: { getDataUrl: (url: string) => void }) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const element = document.querySelector("#chat-body") as HTMLElement;
    if (element) {
      toJpeg(element, {
        width: element.scrollWidth,
        height: element.scrollHeight,
      })
        .then((dataUrl) => {
          setImageUrl(dataUrl);
          props?.getDataUrl(dataUrl);
        })
        .finally(() => setLoading(false));
    }
  }, []);
  return (
    <>
      {loading ? (
        <LoadingIcon />
      ) : (
        <div className={styles["image-wrap"]}>
          <img src={imageUrl} alt="" />
        </div>
      )}
    </>
  );
}
