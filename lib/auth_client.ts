import {ADMIN_LIST, isName} from "@/lib/auth_list";
import { JWT } from "next-auth/jwt";

export async function VerifiedUser(session: JWT |null) {
    const userId = session?.sub
    const name = session?.email || session?.name
    return !!(name && isName(name) && userId);
}

export async function VerifiedAdminUser(session: JWT |null) {
    const name = session?.email || session?.name
    return !!(name && ADMIN_LIST.includes(name));
}