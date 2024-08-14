// 导入必要的依赖
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Locale from "./locales";

// 定义命令类型和命令接口
// Command 是一个接受字符串参数并返回 void 的函数类型
type Command = (param: string) => void;
// Commands 接口定义了可能的命令及其对应的处理函数
interface Commands {
  fill?: Command;
  submit?: Command;
  mask?: Command;
  code?: Command;
  settings?: Command;
}

/**
 * 自定义Hook：useCommand
 * 用于处理URL参数中的命令
 * @param commands - 命令对象，包含可能的命令及其处理函数
 */
export function useCommand(commands: Commands = {}) {
  // 使用 useSearchParams 钩子获取和设置 URL 参数
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let shouldUpdate = false;
    // 遍历URL参数，执行对应的命令
    searchParams.forEach((param, name) => {
      const commandName = name as keyof Commands;
      if (typeof commands[commandName] === "function") {
        commands[commandName]!(param);
        searchParams.delete(name);
        shouldUpdate = true;
      }
    });

    // 如果有更新，则设置新的URL参数
    if (shouldUpdate) {
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, commands]);
}

// 定义聊天命令接口
interface ChatCommands {
  new?: Command; // 新建聊天
  newm?: Command; // 新建面具聊天
  next?: Command; // 下一个聊天
  prev?: Command; // 上一个聊天
  clear?: Command; // 清除聊天历史
  del?: Command; // 删除当前聊天
}

// 定义聊天命令前缀（兼容中文冒号和英文冒号）
export const ChatCommandPrefix = /^[:：]/;

/**
 * 自定义Hook：useChatCommand
 * 用于处理聊天命令
 * @param commands - 聊天命令对象，包含可能的命令及其处理函数
 */
export function useChatCommand(commands: ChatCommands = {}) {
  /**
   * 提取命令
   * @param userInput - 用户输入的字符串
   * @returns 提取出的命令（去掉前缀）
   */
  function extract(userInput: string) {
    const match = userInput.match(ChatCommandPrefix);
    if (match) {
      return userInput.slice(1) as keyof ChatCommands;
    }
    return userInput as keyof ChatCommands;
  }

  /**
   * 搜索匹配的命令
   * @param userInput - 用户输入的字符串
   * @returns 匹配的命令列表，包含标题和内容
   */
  function search(userInput: string) {
    const input = extract(userInput);
    const desc = Locale.Chat.Commands;
    return Object.keys(commands)
      .filter((c) => c.startsWith(input))
      .map((c) => ({
        title: desc[c as keyof ChatCommands],
        content: ":" + c,
      }));
  }

  /**
   * 匹配并执行命令
   * @param userInput - 用户输入的字符串
   * @returns 包含是否匹配和执行函数的对象
   */
  function match(userInput: string) {
    const command = extract(userInput);
    const matched = typeof commands[command] === "function";

    return {
      matched,
      invoke: () => matched && commands[command]!(userInput),
    };
  }

  return { match, search };
}

// 参考资料：
// 1. React Router useSearchParams: https://reactrouter.com/web/api/Hooks/usesearchparams
// 2. React useEffect Hook: https://reactjs.org/docs/hooks-effect.html
// 3. TypeScript Interfaces: https://www.typescriptlang.org/docs/handbook/interfaces.html
// 4. JavaScript Regular Expressions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
