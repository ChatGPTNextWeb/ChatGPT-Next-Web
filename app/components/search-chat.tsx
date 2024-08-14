import { useState, useEffect } from "react";
import { ErrorBoundary } from "./error";
import styles from "./mask.module.scss";
import { useNavigate } from "react-router-dom";
import { IconButton } from "./button";
import CloseIcon from "../icons/close.svg";
import EyeIcon from "../icons/eye.svg";
import Locale from "../locales";
import { Path } from "../constant";

import { useChatStore } from "../store";

type Item = {
  id: number;
  name: string;
  content: string;
};
export function SearchChatPage() {
  const navigate = useNavigate();

  const chatStore = useChatStore();

  const sessions = chatStore.sessions;
  const selectSession = chatStore.selectSession;

  const [searchResults, setSearchResults] = useState<Item[]>([]);

  const setDefaultItems = () => {
    setSearchResults(
      sessions.slice(1, 7).map((session, index) => {
        console.log(session.messages[0]);
        return {
          id: index,
          name: session.topic,
          content: session.messages[0].content as string, //.map((m) => m.content).join("\n")
        };
      }),
    );
  };
  useEffect(() => {
    setDefaultItems();
  }, []);

  const doSearch = (text: string) => {
    // 分割关键词
    const keywords = text.split(" ");

    // 存储每个会话的匹配结果
    const searchResults: Item[] = [];

    sessions.forEach((session, index) => {
      let matchCount = 0;
      const contents: string[] = [];

      session.messages.forEach((message) => {
        const content = message.content as string;
        const lowerCaseContent = content.toLowerCase();
        keywords.forEach((keyword) => {
          const pos = lowerCaseContent.indexOf(keyword.toLowerCase());
          if (pos !== -1) {
            matchCount++;
            // 提取关键词前后70个字符的内容
            const start = Math.max(0, pos - 35);
            const end = Math.min(content.length, pos + keyword.length + 35);
            contents.push(content.substring(start, end));
          }
        });
      });

      if (matchCount > 0) {
        searchResults.push({
          id: index,
          name: session.topic,
          content: contents.join("... "), // 使用...连接不同消息中的内容
        });
      }
    });

    // 按匹配数量排序，取前10个结果
    return searchResults
      .sort((a, b) => b.content.length - a.content.length)
      .slice(0, 10);
  };

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        {/* header */}
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.SearchChat.Page.Title}
            </div>
            <div className="window-header-submai-title">
              {Locale.SearchChat.Page.SubTitle(searchResults.length)}
            </div>
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

        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
            {/**搜索输入框 */}
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.SearchChat.Page.Search}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const searchText = e.currentTarget.value;
                  if (searchText.length > 0) {
                    const result = doSearch(searchText);
                    setSearchResults(result);
                  }
                }
              }}
            />
          </div>

          <div>
            {searchResults.map((item) => (
              <div className={styles["mask-item"]} key={item.id}>
                {/** 搜索匹配的文本 */}
                <div className={styles["mask-header"]}>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]}>{item.name}</div>
                    {item.content.slice(0, 70)}
                  </div>
                </div>
                {/** 操作按钮 */}
                <div className={styles["mask-actions"]}>
                  <IconButton
                    icon={<EyeIcon />}
                    text={Locale.SearchChat.Item.View}
                    onClick={() => {
                      navigate(Path.Chat);
                      selectSession(item.id);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
