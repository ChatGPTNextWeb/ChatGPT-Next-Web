import type { BuiltinMask } from './typing';
import fs from 'node:fs';
import path from 'node:path';
import { CN_MASKS } from './cn';
import { EN_MASKS } from './en';

import { TW_MASKS } from './tw';

const BUILTIN_MASKS: Record<string, BuiltinMask[]> = {
  cn: CN_MASKS,
  tw: TW_MASKS,
  en: EN_MASKS,
};

const dirname = path.dirname(__filename);

fs.writeFile(
  `${dirname}/../../public/masks.json`,
  JSON.stringify(BUILTIN_MASKS, null, 4),
  (error) => {
    if (error) {
      console.error('[Build] failed to build masks', error);
    }
  },
);
