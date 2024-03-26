import { Flex } from "antd";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import UsersTablePart from "../../components/users-table";

// async function getData() {
//   return await prisma.user.findMany({
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// }
export default async function UsersPage() {
  // const users: User[] = await getData();

  // console.log("data", data);

  return (
    <>
      <Flex gap="middle" vertical>
        <UsersTablePart />
      </Flex>
    </>
  );
}
