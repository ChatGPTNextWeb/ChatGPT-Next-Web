import { type Mask } from "../store/mask";

export type BuiltinMask = Omit<Mask, "id">;
