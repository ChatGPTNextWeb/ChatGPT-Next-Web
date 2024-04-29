import { JWT } from "next-auth/jwt";
import { User } from "@prisma/client";

export type CUS_JWT = JWT & {
  user: User,
}
