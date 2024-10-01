import { isName } from "@/lib/auth_list";
import { type JWT } from "next-auth/jwt";


export async function VerifiedUser(session: JWT | null) {
    const userId = session?.sub
    const name = session?.email || session?.name
    return !!(name && isName(name) && userId);
}

export async function VerifiedAdminUser(session: JWT | null) {
    // console.log('-------', session, session?.user?.isAdmin)
    return !!session?.user?.isAdmin;
    // const name = session?.email || session?.name
    // return !!(name && ADMIN_LIST.includes(name));
}

export function VerifiedNeedSetPassword(path: string, session: JWT | null,) {
  const need_set_pwd = !session?.user?.password
  return path === "/login/set-password" && need_set_pwd;
}
