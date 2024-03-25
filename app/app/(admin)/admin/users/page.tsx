import { Flex } from "antd";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import UsersTable from "../../components/users-table";

async function getData() {
  const users = await prisma.user.findMany();
  return users;
}
export default async function UsersPage() {
  const users: User[] = await getData();

  // console.log("data", data);

  return (
    <>
      <Flex gap="middle" vertical>
        <UsersTable users={users} />
      </Flex>
    </>
  );
}
