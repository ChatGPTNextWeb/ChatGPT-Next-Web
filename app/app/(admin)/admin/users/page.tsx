import { Flex } from "antd";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import UsersTable from "../../components/users-table";
import UserTableSearchInput from "../../components/user-table-search";

async function getData() {
  return await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}
export default async function UsersPage() {
  const users: User[] = await getData();

  // console.log("data", data);

  return (
    <>
      <Flex gap="middle" vertical>
        <div style={{ width: "360px;", fontSize: 0 }}>
          <UserTableSearchInput />
        </div>
        <UsersTable users={users} />
      </Flex>
    </>
  );
}
