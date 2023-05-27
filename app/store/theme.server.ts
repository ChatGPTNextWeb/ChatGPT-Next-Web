"use server";
import { cookies } from "next/headers";

export async function changeTheme(theme: string) {
  "use server";

  const cookieStore = cookies();
  cookieStore.set("theme", theme);
}
