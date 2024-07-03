import fs from "fs";
import path from "path";
import { CN_MASKS } from "./cn";
import { TW_MASKS } from "./tw";
import { EN_MASKS } from "./en";

const BUILTIN_MASKS: BuiltinMask[] = {
  cn: CN_MASKS,
  tw: TW_MASKS,
  en: EN_MASKS,
};

const dirname = path.dirname(__filename);

fs.writeFile(
  dirname + "/../../public/masks.json",
  JSON.stringify(BUILTIN_MASKS, null, 4),
  function (error) {
    if (error) {
      console.error("[Build] failed to build masks", error);
    }
  },
);
