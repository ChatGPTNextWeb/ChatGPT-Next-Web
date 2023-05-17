import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./about.module.scss";
import CloseIcon from "../icons/close.svg";
import { useNavigate } from "react-router-dom";
import Locale from "@/app/locales";
import AddIcon from "@/app/icons/add.svg";
import { Path } from "@/app/constant";
import { MaskAvatar } from "@/app/components/mask";

export function About() {
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className={styles["about-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">{"关于"}</div>
            {/*<div className="window-header-submai-title">*/}
            {/*  {Locale.Mask.Page.SubTitle(allMasks.length)}*/}
            {/*</div>*/}
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
        <div className={styles["about-page-body"]}>
          <div className={styles["about-item"]}>
            {
              "AI并不是万能的，应该保持辩证思考的态度，既要充分认识到AI的优势和价值，又要清楚地知道其局限性。"
            }
            {
              "目前AI只能解决80% 左右的问题，还需要自己在认知上对其进行修正、采纳。"
            }
            {
              "在[设置]页输入自己的api-key可绕过密码，密码可以搜索公众号【编程章鱼哥】或者扫描下方二维码获取."
            }
            {"需要购买chatgpt 账号或者api-key的也可以从下方二维码联系我."}
          </div>
          <div className={styles["about-item"]}>
            <div className={styles["about-header"]}>
              {/*<div className={styles["about-icon"]}>*/}
              {/*    {'wertghjkl'}*/}
              {/*</div>*/}
              <div className={styles["about-title"]}>
                <div
                  className={styles["about-name"]}
                  style={{ marginBottom: 10, marginLeft: "40%" }}
                >
                  {"交流群"}
                </div>
                <div className={styles["about-info"] + " one-line"}>
                  <img
                    className={styles["about-item"]}
                    style={{ width: "80%", objectFit: "cover" }}
                    src="https://liuluyanglly.github.io/imgly/wxqun1.jpg"
                    alt="微信:javaxiaogui125"
                  />
                </div>
              </div>
            </div>
            <div className={styles["about-title"]}>
              <div
                className={styles["about-name"]}
                style={{ marginBottom: 10, marginLeft: "40%" }}
              >
                {"公众号"}
              </div>
              <div className={styles["about-info"] + " one-line"}>
                <img
                  className={styles["about-item"]}
                  style={{ width: "80%", height: "auto", objectFit: "cover" }}
                  src="https://liuluyanglly.github.io/imgly/wxgzh.jpg"
                  alt="公众号:编程章鱼哥"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
