import UsageByModel from "./usage-by-model-chart";
import UserByMap from "./user-by-map";
import { getSession } from "@/lib/auth";
import { isName, ADMIN_LIST } from "@/lib/auth_list";
import { redirect } from "next/navigation";
import { Flex } from "antd";

export default async function AdminPage() {
  const session = await getSession();
  const name = session?.user?.email || session?.user?.name;
  if (!(name && ADMIN_LIST.includes(name))) {
    // Replace '/dashboard' with the desired redirect path
    redirect("/");
  }

  return (
    <>
      <Flex gap="middle" vertical>
        <UsageByModel />
        <UserByMap />
      </Flex>
    </>
  );
}
