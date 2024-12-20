import type { ModelConfig } from '../store';
import type { Mask } from '../store/mask';

export type BuiltinMask = Omit<Mask, 'id' | 'modelConfig'> & {
  builtin: boolean;
  modelConfig: Partial<ModelConfig>;
};
