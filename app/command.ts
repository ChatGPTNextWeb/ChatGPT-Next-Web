import { useSearchParams } from "react-router-dom";

type Command = (param: string) => void;
interface Commands {
  fill?: Command;
  submit?: Command;
  mask?: Command;
}

export function useCommand(commands: Commands = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (commands === undefined) return;

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
}
