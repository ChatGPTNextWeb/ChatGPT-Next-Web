import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Locale from "./locales";
import { getClientConfig } from "@/app/config/client";

const isApp = !!getClientConfig()?.isApp;

type Command = (param: string) => void;
interface Commands {
  fill?: Command;
  submit?: Command;
  mask?: Command;
  code?: Command;
  settings?: Command;
}

export function useCommand(commands: Commands = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    let shouldUpdate = false;
    searchParams.forEach((param, name) => {
      const commandName = name as keyof Commands;
      if (typeof commands[commandName] === "function") {
        commands[commandName]!(param);
        searchParams.delete(name);
        shouldUpdate = true;
      }
    });

    if (shouldUpdate) {
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, commands]);
}

interface ChatCommands {
  new?: Command;
  newm?: Command;
  next?: Command;
  prev?: Command;
  restart?: Command;
  clear?: Command;
  del?: Command;
}

export const ChatCommandPrefix = ":";

export function useChatCommand(commands: ChatCommands = {}) {
  const chatCommands = { ...commands };

  if (!isApp) {
    delete chatCommands.restart;
  }

  function extract(userInput: string) {
    return (
      userInput.startsWith(ChatCommandPrefix) ? userInput.slice(1) : userInput
    ) as keyof ChatCommands;
  }

  function search(userInput: string) {
    const input = extract(userInput);
    const desc = Locale.Chat.Commands;
    return Object.keys(chatCommands)
      .filter((c) => c.startsWith(input))
      .map((c) => ({
        title: desc[c as keyof ChatCommands],
        content: ChatCommandPrefix + c,
      }));
  }

  function match(userInput: string) {
    const command = extract(userInput);
    const matched = typeof chatCommands[command] === "function";

    return {
      matched,
      invoke: () => matched && chatCommands[command]!(userInput),
    };
  }

  return { match, search };
}
